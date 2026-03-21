import { useState, useEffect, useCallback, useRef } from 'react'
import { buildPromptPayload, type AIAnalysisResult } from '@/lib/ai'
import type { BranchFullReport } from '@/data/hadera-real'

const cache = new Map<string, AIAnalysisResult>()

export function useAIAnalysis(branchId: string, report: BranchFullReport) {
  const [result, setResult] = useState<AIAnalysisResult | null>(cache.get(branchId) ?? null)
  const [isLoading, setIsLoading] = useState(!cache.has(branchId))
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchAnalysis = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true)
    setError(null)

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

      const data: AIAnalysisResult = await response.json()
      cache.set(branchId, data)
      if (!signal.aborted) {
        setResult(data)
        setIsLoading(false)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'AI analysis failed')
        setIsLoading(false)
      }
    }
  }, [branchId, report])

  useEffect(() => {
    if (cache.has(branchId)) {
      setResult(cache.get(branchId)!)
      setIsLoading(false)
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
    briefing: result?.briefing ?? null,
    recommendations: result?.recommendations ?? null,
    isLoading,
    error,
    retry,
  }
}
