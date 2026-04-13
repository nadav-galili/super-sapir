import { useState, useEffect, useCallback, useRef } from 'react'
import { buildChainPromptPayload, type ChainAIResult, type ChainInsightRow } from '@/lib/chain-ai'
import { getFromCache, setInCache, removeFromCache } from '@/lib/ai-cache'

const CACHE_KEY = 'chain:trade-manager'

function getCached(): ChainAIResult | null {
  return getFromCache<ChainAIResult>(CACHE_KEY)
}

const CHAIN_SYSTEM_PROMPT = `אתה יועץ אנליטיקה בכיר למנהל המסחר של רשת סופר ספיר. אתה מנתח את ביצועי הרשת כולה ומספק תובנות אסטרטגיות ממוקדות פעולה בעברית.

פורמט פלט: שורת JSON אחת לכל פריט (JSONL). כל שורה חייבת להיות אובייקט JSON תקין ושלם.
אין לעטוף באובייקט חיצוני. אין markdown. אין טקסט מלבד שורות ה-JSON.

פלט בדיוק 4 שורות, כל שורה מייצגת נושא שונה לניתוח.

פורמט כל שורה:
{"type":"insight","subject":"נושא הניתוח","recommendation":"המלצה קונקרטית לפעולה","status":"red"}

ערכי status (רמזור):
- "red" — דחוף, דורש טיפול מיידי
- "yellow" — בינוני, דורש תשומת לב
- "green" — מצב טוב, להמשיך במסלול

כללים:
- פלט רק שורות JSON, ללא טקסט נוסף
- אובייקט JSON אחד בכל שורה
- כל הטקסט בעברית
- אל תתייחס לסניפים בודדים — מנהל המסחר מתעניין בקטגוריות, ספקים, מבצעים ומגמות ברמת הרשת
- התמקד ב: ביצועי קטגוריות, יחסי ספקים ותנאי סחר, אפקטיביות מבצעים, רווחיות גולמית, חוסרים וזמינות מדף
- ציין שמות קטגוריות, ספקים ומבצעים ספציפיים עם מספרים
- הצע פעולות קונקרטיות שמנהל מסחר יכול לנקוט (משא ומתן מול ספקים, שינוי מיקס מבצעים, הרחבת קטגוריה, וכו׳)
- נושא = תחום אסטרטגי (לדוגמה: רווחיות ספקים, אפקטיביות מבצעים, חוסרים במדף, צמיחת קטגוריה)
- המלצה = פעולה ספציפית עם מספרים ופרטים
- ודא שיש מגוון סטטוסים (לא הכל אדום או ירוק)

שפה ונימה:
- השתמש בשפה מקצועית, מכבדת ועניינית
- אין להשתמש במילים פוגעניות, משפילות או שליליות כמו: מפגר, כושל, נכשל, גרוע, איום, עלוב
- במקום "מפגר ביעד" אמור "לא עומד ביעד" או "מתחת ליעד"
- במקום "כושל" אמור "דורש שיפור" או "מציג ביצועים נמוכים"
- שמור על טון בונה ומכוון לפתרון — לא ביקורתי או שיפוטי`

export function useChainAIAnalysis() {
  const cached = getCached()
  const hasValidCache = cached != null && Array.isArray(cached.rows)
  const [rows, setRows] = useState<ChainInsightRow[]>(hasValidCache ? cached.rows : [])
  const [isLoading, setIsLoading] = useState(!hasValidCache)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchAnalysis = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true)
    setIsStreaming(false)
    setError(null)
    setRows([])

    try {
      const payload = buildChainPromptPayload()
      const userPrompt = `נתח את ביצועי רשת סופר ספיר כולה מנקודת המבט של מנהל המסחר. התמקד בקטגוריות, ספקים ומבצעים — סיכונים, הזדמנויות, ופעולות אסטרטגיות.\n\n${JSON.stringify(payload, null, 2)}`

      const response = await fetch('/.netlify/functions/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          systemPrompt: CHAIN_SYSTEM_PROMPT,
          userPrompt,
        }),
        signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error ?? `HTTP ${response.status}`)
      }

      if (!response.body) throw new Error('No response body')

      setIsLoading(false)
      setIsStreaming(true)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const collectedRows: ChainInsightRow[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (signal.aborted) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const block of lines) {
          const line = block.trim()
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          let item
          try { item = JSON.parse(data) } catch { continue }

          if (item.type === 'error') {
            setError(item.message ?? 'שגיאת AI')
            break
          }

          if (item.type === 'insight' && item.data) {
            collectedRows.push(item.data)
            setRows([...collectedRows])
          }
        }
      }

      if (!signal.aborted) {
        if (collectedRows.length > 0) {
          setInCache(CACHE_KEY, { rows: collectedRows })
        } else if (!error) {
          setError('ניתוח AI לא החזיר תוצאות')
        }
        setIsStreaming(false)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'AI analysis failed')
        setIsLoading(false)
        setIsStreaming(false)
      }
    }
  }, [])

  useEffect(() => {
    const stored = getCached()
    if (stored && Array.isArray(stored.rows)) {
      setRows(stored.rows)
      setIsLoading(false)
      setIsStreaming(false)
      setError(null)
      return
    }
    if (stored) removeFromCache(CACHE_KEY)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchAnalysis(controller.signal)

    return () => controller.abort()
  }, [fetchAnalysis])

  const retry = useCallback(() => {
    removeFromCache(CACHE_KEY)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchAnalysis(controller.signal)
  }, [fetchAnalysis])

  return {
    rows: rows.length > 0 ? rows : null,
    isLoading,
    isStreaming,
    error,
    retry,
  }
}
