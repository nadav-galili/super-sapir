import { useState, useEffect, useCallback, useRef } from 'react'
import { buildPromptPayload, type AIAnalysisResult, type BriefingItem, type Recommendation } from '@/lib/ai'
import type { BranchFullReport } from '@/data/hadera-real'

const cache = new Map<string, AIAnalysisResult>()

export function useAIAnalysis(branchId: string, report: BranchFullReport) {
  const [briefing, setBriefing] = useState<BriefingItem[]>(cache.get(branchId)?.briefing ?? [])
  const [recommendations, setRecommendations] = useState<Recommendation[]>(cache.get(branchId)?.recommendations ?? [])
  const [isLoading, setIsLoading] = useState(!cache.has(branchId))
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
      const payload = buildPromptPayload(report)
      const response = await fetch('/.netlify/functions/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
        signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error ?? `HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

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

          try {
            const item = JSON.parse(data)
            if (item.type === 'briefing') {
              collectedBriefing.push(item.data)
              setBriefing([...collectedBriefing])
            } else if (item.type === 'recommendation') {
              collectedRecs.push(item.data)
              setRecommendations([...collectedRecs])
            }
          } catch { /* skip malformed events */ }
        }
      }

      if (!signal.aborted) {
        cache.set(branchId, { briefing: collectedBriefing, recommendations: collectedRecs })
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
  }, [branchId, report])

  useEffect(() => {
    if (cache.has(branchId)) {
      const cached = cache.get(branchId)!
      setBriefing(cached.briefing)
      setRecommendations(cached.recommendations)
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
  }, [branchId, fetchAnalysis])

  const retry = useCallback(() => {
    cache.delete(branchId)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchAnalysis(controller.signal)
  }, [branchId, fetchAnalysis])

  return {
    briefing: briefing.length > 0 ? briefing : null,
    recommendations: recommendations.length > 0 ? recommendations : null,
    isLoading,
    isStreaming,
    error,
    retry,
  }
}
