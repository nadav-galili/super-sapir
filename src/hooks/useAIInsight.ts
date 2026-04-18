// Generic React hook that drives the AI engine. Replaces the three
// per-surface hooks (store / category / chain) with one parameterized
// on a builder. The surface-level briefing components only see
// `{ rows, isLoading, isStreaming, error, retry }` — the same
// contract they had before.

import { useCallback, useEffect, useRef, useState } from "react";
import { runAIInsight } from "@/lib/ai/engine";
import { httpSseTransport, type AITransport } from "@/lib/ai/transport";
import { localStorageCache, type AICachePort } from "@/lib/ai/cache";
import type { AIBuildResult, AIPhase, InsightRow } from "@/lib/ai/types";

export interface UseAIInsightOptions {
  transport?: AITransport;
  cache?: AICachePort;
}

export interface UseAIInsightResult {
  rows: InsightRow[] | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * @param build  Call the builder synchronously in the component and
 *               pass the result in. The hook uses `build.cacheKey`
 *               as the dependency key — when it changes, the hook
 *               re-runs with the new payload.
 */
export function useAIInsight<TPayload>(
  build: AIBuildResult<TPayload>,
  options: UseAIInsightOptions = {}
): UseAIInsightResult {
  const transport = options.transport ?? httpSseTransport;
  const cache = options.cache ?? localStorageCache;

  const initialCached = cache.get(build.cacheKey);
  const hasValidCache =
    initialCached != null &&
    Array.isArray(initialCached.rows) &&
    initialCached.rows.length > 0;

  const [rows, setRows] = useState<InsightRow[]>(
    hasValidCache ? initialCached.rows : []
  );
  const [phase, setPhase] = useState<AIPhase>(
    hasValidCache ? "success" : "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Keep refs to the per-render values so `retry` can re-run with the
  // latest build without requiring callers to memoize the object.
  const buildRef = useRef(build);
  const transportRef = useRef(transport);
  const cacheRef = useRef(cache);
  useEffect(() => {
    buildRef.current = build;
    transportRef.current = transport;
    cacheRef.current = cache;
  });

  const run = useCallback(async (useCache: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    if (!useCache) setRows([]);

    await runAIInsight({
      build: buildRef.current,
      transport: transportRef.current,
      cache: cacheRef.current,
      signal: controller.signal,
      useCache,
      onPhase: (p) => {
        if (controller.signal.aborted) return;
        setPhase(p);
      },
      onRows: (nextRows) => {
        if (controller.signal.aborted) return;
        setRows(nextRows);
      },
      onError: (msg) => {
        if (controller.signal.aborted) return;
        setError(msg);
      },
    });
  }, []);

  useEffect(() => {
    // `run` returns a Promise — its setState calls happen inside
    // microtask-deferred stream handlers and a guarded abort-signal
    // check, so the cascading-render lint rule doesn't apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run(true);
    return () => {
      abortRef.current?.abort();
    };
  }, [build.cacheKey, run]);

  const retry = useCallback(() => {
    cacheRef.current.remove(buildRef.current.cacheKey);
    run(false);
  }, [run]);

  return {
    rows: rows.length > 0 ? rows : null,
    isLoading: phase === "loading",
    isStreaming: phase === "streaming",
    error,
    retry,
  };
}
