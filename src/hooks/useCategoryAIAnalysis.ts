import { useState, useEffect, useCallback, useRef } from 'react'
import { buildCategoryPromptPayload, type CategoryAIResult, type BriefingItem, type Recommendation } from '@/lib/category-ai'
import { getFromCache, setInCache, removeFromCache } from '@/lib/ai-cache'

function getCached(categoryId: string): CategoryAIResult | null {
  return getFromCache<CategoryAIResult>(`category:${categoryId}`)
}

const CATEGORY_SYSTEM_PROMPT = `אתה יועץ אנליטיקה למנהל קטגוריה ברשת סופר ספיר. אתה מנתח ביצועי ספקים, חריגות, ופוטנציאלים בקטגוריה ספציפית — ומספק תובנות ממוקדות פעולה בעברית.

פורמט פלט: שורת JSON אחת לכל פריט (JSONL). כל שורה חייבת להיות אובייקט JSON תקין ושלם.
אין לעטוף באובייקט חיצוני. אין markdown. אין טקסט מלבד שורות ה-JSON.

תחילה פלט פריטי תדריך (4-6), ואחר כך המלצות (2-3).

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
- התמקד בניתוח ספקים: חריגות יעדים, שיעורי חוסרים, רווחיות, ומגמות
- ציין שמות ספקים ומספרים ספציפיים
- הצע פעולות קונקרטיות שמנהל קטגוריה יכול לנקוט
- דרג לפי דחיפות (priority 1 = הדחוף ביותר)`

export function useCategoryAIAnalysis(categoryId: string) {
  const cached = getCached(categoryId)
  const [briefing, setBriefing] = useState<BriefingItem[]>(cached?.briefing ?? [])
  const [recommendations, setRecommendations] = useState<Recommendation[]>(cached?.recommendations ?? [])
  const [isLoading, setIsLoading] = useState(!cached)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchAnalysis = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true)
    setIsStreaming(false)
    setError(null)
    setBriefing([])
    setRecommendations([])

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
      const collectedBriefing: BriefingItem[] = []
      const collectedRecs: Recommendation[] = []

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

          if (item.type === 'briefing' && item.data) {
            collectedBriefing.push(item.data)
            setBriefing([...collectedBriefing])
          } else if (item.type === 'recommendation' && item.data) {
            collectedRecs.push(item.data)
            setRecommendations([...collectedRecs])
          }
        }
      }

      if (!signal.aborted) {
        if (collectedBriefing.length > 0 || collectedRecs.length > 0) {
          setInCache(`category:${categoryId}`, { briefing: collectedBriefing, recommendations: collectedRecs })
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
    if (stored) {
      setBriefing(stored.briefing)
      setRecommendations(stored.recommendations)
      setIsLoading(false)
      setIsStreaming(false)
      setError(null)
      return
    }

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
    briefing: briefing.length > 0 ? briefing : null,
    recommendations: recommendations.length > 0 ? recommendations : null,
    isLoading,
    isStreaming,
    error,
    retry,
  }
}
