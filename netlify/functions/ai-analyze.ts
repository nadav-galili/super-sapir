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

  let payload: unknown
  try {
    const body = await req.json()
    payload = body.payload
    if (!payload) throw new Error('Missing payload')
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
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
      return new Response(JSON.stringify({ error: `Anthropic API error: ${response.status}`, details: errorText }), {
        status: response.status === 429 ? 429 : 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''

    // Parse JSON from response (handle possible markdown wrapping)
    let result
    try {
      result = JSON.parse(text)
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match?.[1]) {
        result = JSON.parse(match[1].trim())
      } else {
        throw new Error('Failed to parse AI response')
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'AI analysis failed', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
