// AI engine — pure runner. Given a build result, a transport, and a
// cache, it drives the full lifecycle: cache lookup, transport call,
// SSE parsing, row accumulation, cache write on success. The three
// callbacks (`onPhase`, `onRows`, `onError`) let the generic hook
// translate this into React state without any branch-specific logic
// leaking into the engine.

import type {
  AIBuildResult,
  AIInsightResult,
  AIPhase,
  InsightRow,
} from "./types";
import type { AITransport } from "./transport";
import type { AICachePort } from "./cache";

export interface RunAIInsightOptions<TPayload> {
  build: AIBuildResult<TPayload>;
  transport: AITransport;
  cache: AICachePort;
  signal: AbortSignal;
  /** If false, skip the initial cache lookup (used by retry). */
  useCache?: boolean;
  onPhase?: (phase: AIPhase) => void;
  onRows?: (rows: InsightRow[]) => void;
  onError?: (message: string) => void;
}

/**
 * Runs a single AI-insight request end-to-end.
 *
 * Resolves to the final `AIInsightResult` on success (also written to
 * cache), or `null` if the request was aborted or errored before any
 * rows arrived. Errors are reported via `onError` and cause the
 * promise to resolve to `null` — the engine never throws for expected
 * failures; it throws only for programmer errors.
 */
export async function runAIInsight<TPayload>(
  opts: RunAIInsightOptions<TPayload>
): Promise<AIInsightResult | null> {
  const {
    build,
    transport,
    cache,
    signal,
    useCache = true,
    onPhase,
    onRows,
    onError,
  } = opts;

  // 1. Cache hit — skip network entirely.
  if (useCache) {
    const cached = cache.get(build.cacheKey);
    if (cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
      onPhase?.("success");
      onRows?.(cached.rows);
      return cached;
    }
    if (cached) {
      // Stale / malformed entry — clear it and proceed to fetch.
      cache.remove(build.cacheKey);
    }
  }

  onPhase?.("loading");

  let stream: AsyncIterable<string>;
  try {
    stream = await transport.send({
      payload: build.payload,
      systemPrompt: build.systemPrompt,
      userPrompt: build.userPrompt,
      signal,
    });
  } catch (err) {
    if (isAbort(err, signal)) return null;
    onPhase?.("error");
    onError?.(err instanceof Error ? err.message : "AI analysis failed");
    return null;
  }

  onPhase?.("streaming");

  const collected: InsightRow[] = [];
  let buffer = "";
  let sawError = false;

  try {
    for await (const chunk of stream) {
      if (signal.aborted) break;
      buffer += chunk;
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const line = block.trim();
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        let item: unknown;
        try {
          item = JSON.parse(data);
        } catch {
          continue;
        }

        const parsed = item as {
          type?: string;
          message?: string;
          data?: InsightRow;
        };

        if (parsed.type === "error") {
          sawError = true;
          onPhase?.("error");
          onError?.(parsed.message ?? "שגיאת AI");
          break;
        }

        if (parsed.type === "insight" && parsed.data) {
          collected.push(parsed.data);
          onRows?.([...collected]);
        }
      }

      if (sawError) break;
    }
  } catch (err) {
    if (isAbort(err, signal)) return null;
    onPhase?.("error");
    onError?.(err instanceof Error ? err.message : "AI analysis failed");
    return null;
  }

  if (signal.aborted) return null;
  if (sawError) return null;

  if (collected.length === 0) {
    onPhase?.("error");
    onError?.("ניתוח AI לא החזיר תוצאות");
    return null;
  }

  const result: AIInsightResult = { rows: collected };
  cache.set(build.cacheKey, result);
  onPhase?.("success");
  return result;
}

function isAbort(err: unknown, signal: AbortSignal): boolean {
  if (signal.aborted) return true;
  if (err instanceof Error && err.name === "AbortError") return true;
  return false;
}
