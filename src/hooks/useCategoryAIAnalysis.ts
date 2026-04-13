import { useState, useEffect, useCallback, useRef } from 'react'
import { buildCategoryPromptPayload, type CategoryAIResult, type CategoryInsightRow } from '@/lib/category-ai'
import { getFromCache, setInCache, removeFromCache } from '@/lib/ai-cache'

function getCached(categoryId: string): CategoryAIResult | null {
  return getFromCache<CategoryAIResult>(`category:${categoryId}`)
}

const CATEGORY_SYSTEM_PROMPT = `אתה יועץ אנליטיקה למנהל קטגוריה ברשת סופר ספיר. אתה מנתח ביצועי ספקים, חריגות, ופוטנציאלים בקטגוריה ספציפית — ומספק תובנות ממוקדות פעולה בעברית.

פורמט פלט: שורת JSON אחת לכל פריט (JSONL). כל שורה חייבת להיות אובייקט JSON תקין ושלם.
אין לעטוף באובייקט חיצוני. אין markdown. אין טקסט מלבד שורות ה-JSON.

פלט בדיוק 3-4 שורות, כל שורה מייצגת נושא שונה לניתוח.

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
- התמקד בניתוח ספקים: חריגות יעדים, שיעורי חוסרים, רווחיות, ומגמות
- ציין שמות ספקים ומספרים ספציפיים
- הצע פעולות קונקרטיות שמנהל קטגוריה יכול לנקוט
- נושא = תחום הניתוח (לדוגמה: עמידה ביעדים, חוסרים במלאי, רווחיות ספקים, מגמת מכירות)
- המלצה = פעולה ספציפית עם מספרים ופרטים
- ודא שיש מגוון סטטוסים (לא הכל אדום או ירוק)

שפה ונימה:
- השתמש בשפה מקצועית, מכבדת ועניינית
- אין להשתמש במילים פוגעניות, משפילות או שליליות כמו: מפגר, כושל, נכשל, גרוע, איום, עלוב
- במקום "מפגר ביעד" אמור "לא עומד ביעד" או "מתחת ליעד"
- במקום "כושל" אמור "דורש שיפור" או "מציג ביצועים נמוכים"
- במקום "ירידה דרמטית" אמור "ירידה משמעותית"
- שמור על טון בונה ומכוון לפתרון — לא ביקורתי או שיפוטי`

export function useCategoryAIAnalysis(categoryId: string) {
  const cached = getCached(categoryId)
  const hasValidCache = cached != null && Array.isArray(cached.rows)
  const [rows, setRows] = useState<CategoryInsightRow[]>(hasValidCache ? cached.rows : [])
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
      const categoryPayload = buildCategoryPromptPayload(categoryId)
      const userPrompt = `נתח את ביצועי הקטגוריה "${categoryPayload.category}" ברשת. התמקד בספקים — חריגות, פוטנציאל, ופעולות שמנהל הקטגוריה צריך לנקוט.\n\n${JSON.stringify(categoryPayload, null, 2)}`

      const response = await fetch('/.netlify/functions/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: categoryPayload,
          systemPrompt: CATEGORY_SYSTEM_PROMPT,
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
      const collectedRows: CategoryInsightRow[] = []

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
          setInCache(`category:${categoryId}`, { rows: collectedRows })
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
  }, [categoryId])

  useEffect(() => {
    const stored = getCached(categoryId)
    if (stored && Array.isArray(stored.rows)) {
      setRows(stored.rows)
      setIsLoading(false)
      setIsStreaming(false)
      setError(null)
      return
    }
    // Stale cache with old format — clear it
    if (stored) removeFromCache(`category:${categoryId}`)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchAnalysis(controller.signal)

    return () => controller.abort()
  }, [categoryId, fetchAnalysis])

  const retry = useCallback(() => {
    removeFromCache(`category:${categoryId}`)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchAnalysis(controller.signal)
  }, [categoryId, fetchAnalysis])

  return {
    rows: rows.length > 0 ? rows : null,
    isLoading,
    isStreaming,
    error,
    retry,
  }
}
