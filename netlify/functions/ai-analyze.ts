import type { Context } from '@netlify/functions'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPT = `אתה יועץ אנליטיקה לרשת סופר ספיר. אתה מנתח דוחות ניהוליים של סניפים ומספק תובנות ממוקדות פעולה בעברית.

עליך להחזיר JSON תקין בלבד, ללא markdown, ללא הסבר מחוץ ל-JSON.

סכמת התגובה:
{
  "briefing": [
    { "priority": 1, "icon": "alert|trend|target|staff|quality", "text": "..." },
    ... (3-5 פריטים)
  ],
  "recommendations": [
    {
      "title": "...",
      "description": "...",
      "impact": "high|medium|low",
      "category": "sales|operations|hr|compliance",
      "estimatedEffect": "..."
    },
    ... (2-3 המלצות)
  ]
}

כללים:
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

  const userPrompt = `נתח את הדוח הניהולי הבא של סניף ותן תדריך בוקר עם פריטים ממוקדי פעולה, והמלצות אסטרטגיות. התייחס לחריגות, יעדים שלא הושגו, ומגמות.\n\n${JSON.stringify(payload, null, 2)}`

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
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
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

    const data = await response.json()
    const textBlock = data.content?.[0]
    if (!textBlock || textBlock.type !== 'text' || typeof textBlock.text !== 'string' || textBlock.text.trim() === '') {
      console.error('Unexpected AI response structure:', JSON.stringify(data.content?.map((b: { type: string }) => b.type) ?? 'no content'))
      return new Response(JSON.stringify({ error: 'תגובת AI לא צפויה' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const text = textBlock.text

    // Parse JSON from response (handle possible markdown wrapping)
    let result
    try {
      result = JSON.parse(text)
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match?.[1]) {
        try {
          result = JSON.parse(match[1].trim())
        } catch (innerErr) {
          console.error('Failed to parse extracted JSON:', match[1].trim().slice(0, 300))
          throw innerErr
        }
      } else {
        console.error('AI response is not JSON:', text.slice(0, 300))
        throw new Error('Failed to parse AI response')
      }
    }

    // Validate response schema
    if (!Array.isArray(result.briefing) || !Array.isArray(result.recommendations)) {
      console.error('AI response does not match schema:', JSON.stringify({ briefing: typeof result.briefing, recommendations: typeof result.recommendations }))
      return new Response(JSON.stringify({ error: 'תגובת AI לא תקינה' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('AI analysis failed:', err)
    return new Response(JSON.stringify({ error: 'ניתוח AI נכשל' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
