import type { Context } from '@netlify/functions'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPT = `אתה יועץ אנליטיקה לרשת סופר ספיר. אתה מנתח דוחות ניהוליים של סניפים ומספק תובנות ממוקדות פעולה בעברית.

פורמט פלט: שורת JSON אחת לכל פריט (JSONL). כל שורה חייבת להיות אובייקט JSON תקין ושלם.
אין לעטוף באובייקט חיצוני. אין markdown. אין טקסט מלבד שורות ה-JSON.

תחילה פלט פריטי תדריך (3-5), ואחר כך המלצות (2-3).

פורמט שורת תדריך:
{"type":"briefing","priority":1,"icon":"alert","text":"תיאור התובנה"}

ערכי icon אפשריים: alert, trend, target, staff, quality

פורמט שורת המלצה:
{"type":"recommendation","title":"כותרת","description":"תיאור מפורט","impact":"high","category":"sales","estimatedEffect":"אומדן השפעה"}

ערכי impact: high, medium, low
ערכי category: sales, operations, hr, compliance

כללים:
- פלט רק שורות JSON, ללא טקסט נוסף
- אובייקט JSON אחד בכל שורה
- כל הטקסט בעברית
- התמקד בפריטים קריטיים וממוקדי פעולה
- ציין מספרים ספציפיים מהדוח
- דרג לפי דחיפות (priority 1 = הדחוף ביותר)
- icon: alert=חריגה, trend=מגמה, target=יעד, staff=כ"א, quality=איכות`

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Request body is not valid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = body.payload
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Missing required field: payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Allow callers to override prompts (e.g. category AI analysis)
  const systemOverride = typeof body.systemPrompt === 'string' ? body.systemPrompt : null
  const userOverride = typeof body.userPrompt === 'string' ? body.userPrompt : null

  const systemMessage = systemOverride ?? SYSTEM_PROMPT
  const userPrompt = userOverride ?? `נתח את הדוח הניהולי הבא של סניף ותן תדריך בוקר עם פריטים ממוקדי פעולה, והמלצות אסטרטגיות. התייחס לחריגות, יעדים שלא הושגו, ומגמות.\n\n${JSON.stringify(payload, null, 2)}`

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemMessage,
        messages: [{ role: 'user', content: userPrompt }],
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Anthropic API error ${response.status}: ${errorText}`)
      const status = response.status === 429 ? 429 : 502
      const message = response.status === 429
        ? 'שירות AI עמוס כרגע, נסה שוב בעוד מספר שניות'
        : `שגיאת שירות AI (${response.status})`
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!response.body) {
      console.error('Anthropic API returned 200 OK but with no response body')
      return new Response(JSON.stringify({ error: 'תגובת AI ריקה' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Stream items to the client as each JSONL line completes from Anthropic
    const encoder = new TextEncoder()
    const anthropicReader = response.body.getReader()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        let anthropicBuffer = ''
        let textBuffer = ''
        let fullText = ''
        let itemCount = 0

        try {
          while (true) {
            const { done, value } = await anthropicReader.read()
            if (done) break

            anthropicBuffer += decoder.decode(value, { stream: true })

            const sseLines = anthropicBuffer.split('\n')
            anthropicBuffer = sseLines.pop() ?? ''

            for (const line of sseLines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6)
              if (data === '[DONE]') continue

              let event
              try {
                event = JSON.parse(data)
              } catch {
                continue // genuinely malformed SSE line
              }

              if (event.type === 'content_block_delta' && event.delta?.text) {
                textBuffer += event.delta.text
                fullText += event.delta.text

                // Extract complete JSONL lines and forward immediately
                const jsonLines = textBuffer.split('\n')
                textBuffer = jsonLines.pop() ?? ''

                for (const jsonLine of jsonLines) {
                  const trimmed = jsonLine.trim()
                  if (!trimmed) continue
                  try {
                    const item = JSON.parse(trimmed)
                    const sseEvent = formatSSEItem(item)
                    if (sseEvent) {
                      controller.enqueue(encoder.encode(sseEvent))
                      itemCount++
                    }
                  } catch (parseErr) {
                    if (!(parseErr instanceof SyntaxError)) {
                      console.error('Error processing JSONL line:', parseErr, 'Line:', trimmed.slice(0, 200))
                    }
                  }
                }
              }
            }
          }

          // Process remaining buffer
          const remaining = textBuffer.trim()
          if (remaining) {
            try {
              const item = JSON.parse(remaining)
              const sseEvent = formatSSEItem(item)
              if (sseEvent) {
                controller.enqueue(encoder.encode(sseEvent))
                itemCount++
              }
            } catch (err) {
              console.warn('Failed to parse remaining buffer at end of stream:', remaining.slice(0, 300), err)
            }
          }

          // Fallback: if JSONL parsing found nothing, try as wrapped JSON
          if (itemCount === 0) {
            console.warn('JSONL streaming produced 0 items, falling back to wrapped JSON parse. fullText length:', fullText.length)
            const fallbackEvents = tryParseFallbackJSON(fullText)
            if (fallbackEvents.length === 0) {
              console.error('Fallback JSON parse also produced 0 items. AI text preview:', fullText.slice(0, 500))
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'AI returned unparseable response' })}\n\n`),
              )
            }
            for (const ev of fallbackEvents) {
              controller.enqueue(encoder.encode(ev))
            }
          }
        } catch (err) {
          console.error('Stream processing error:', err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Stream processing failed' })}\n\n`),
          )
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('AI analysis failed:', err)
    return new Response(JSON.stringify({ error: 'ניתוח AI נכשל' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function formatSSEItem(item: Record<string, unknown>): string | null {
  if (item.type === 'briefing') {
    const { type: _, ...data } = item
    return `data: ${JSON.stringify({ type: 'briefing', data })}\n\n`
  }
  if (item.type === 'recommendation') {
    const { type: _, ...data } = item
    return `data: ${JSON.stringify({ type: 'recommendation', data })}\n\n`
  }
  console.warn('Unrecognized JSONL item type:', item.type)
  return null
}

function tryParseFallbackJSON(text: string): string[] {
  const events: string[] = []
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match?.[1]) {
      try {
        parsed = JSON.parse(match[1].trim())
      } catch {
        return events
      }
    } else {
      return events
    }
  }

  if (Array.isArray(parsed.briefing)) {
    for (const item of parsed.briefing.sort((a: { priority: number }, b: { priority: number }) => a.priority - b.priority)) {
      const ev = formatSSEItem({ type: 'briefing', ...item })
      if (ev) events.push(ev)
    }
  }
  if (Array.isArray(parsed.recommendations)) {
    for (const item of parsed.recommendations) {
      const ev = formatSSEItem({ type: 'recommendation', ...item })
      if (ev) events.push(ev)
    }
  }
  return events
}
