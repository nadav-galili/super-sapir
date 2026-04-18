// Full-lifecycle tests for the engine using the in-memory transport
// and cache adapters. The engine is the only place that owns the
// SSE-parsing, cache-write, and phase-transition logic so these tests
// cover all three branches.

import { describe, expect, it, vi } from "vitest";
import { runAIInsight } from "./engine";
import { createInMemoryTransport } from "./transport";
import { createInMemoryCache } from "./cache";
import type { AIBuildResult, AIPhase, InsightRow } from "./types";

function sseBlock(row: InsightRow): string {
  return `data: ${JSON.stringify({ type: "insight", data: row })}\n\n`;
}

function build(): AIBuildResult<{ k: number }> {
  return {
    cacheKey: "test:1",
    payload: { k: 1 },
    systemPrompt: "sys",
    userPrompt: "usr",
  };
}

describe("runAIInsight", () => {
  it("streams rows, resolves to the collected result, and writes to cache", async () => {
    const rows: InsightRow[] = [
      { subject: "A", recommendation: "do a", status: "red" },
      { subject: "B", recommendation: "do b", status: "green" },
    ];
    const transport = createInMemoryTransport({
      chunks: [sseBlock(rows[0]), sseBlock(rows[1]), "data: [DONE]\n\n"],
    });
    const cache = createInMemoryCache();
    const phases: AIPhase[] = [];
    const onRows = vi.fn();

    const result = await runAIInsight({
      build: build(),
      transport,
      cache,
      signal: new AbortController().signal,
      onPhase: (p) => phases.push(p),
      onRows,
    });

    expect(result).toEqual({ rows });
    expect(cache.get("test:1")).toEqual({ rows });
    expect(phases).toContain("loading");
    expect(phases).toContain("streaming");
    expect(phases[phases.length - 1]).toBe("success");
    // onRows was called twice (once per row).
    expect(onRows).toHaveBeenCalledTimes(2);
  });

  it("short-circuits when a cached entry exists", async () => {
    const cache = createInMemoryCache();
    cache.set("test:1", {
      rows: [{ subject: "cached", recommendation: "x", status: "yellow" }],
    });
    const transport = createInMemoryTransport({ chunks: [] });
    const sendSpy = vi.spyOn(transport, "send");

    const result = await runAIInsight({
      build: build(),
      transport,
      cache,
      signal: new AbortController().signal,
    });

    expect(result?.rows[0].subject).toBe("cached");
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it("bypasses cache when useCache is false (retry path)", async () => {
    const cache = createInMemoryCache();
    cache.set("test:1", {
      rows: [{ subject: "stale", recommendation: "x", status: "yellow" }],
    });
    const fresh: InsightRow = {
      subject: "fresh",
      recommendation: "y",
      status: "green",
    };
    const transport = createInMemoryTransport({ chunks: [sseBlock(fresh)] });

    const result = await runAIInsight({
      build: build(),
      transport,
      cache,
      signal: new AbortController().signal,
      useCache: false,
    });

    expect(result?.rows).toEqual([fresh]);
    expect(cache.get("test:1")?.rows).toEqual([fresh]);
  });

  it("surfaces transport errors via onError and enters the error phase", async () => {
    const err = new Error("boom");
    const transport = createInMemoryTransport({ chunks: [], error: err });
    const cache = createInMemoryCache();
    const phases: AIPhase[] = [];
    const onError = vi.fn();

    const result = await runAIInsight({
      build: build(),
      transport,
      cache,
      signal: new AbortController().signal,
      onPhase: (p) => phases.push(p),
      onError,
    });

    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledWith("boom");
    expect(phases[phases.length - 1]).toBe("error");
    expect(cache.get("test:1")).toBeNull();
  });

  it("honours inline {type:'error'} messages in the SSE stream", async () => {
    const transport = createInMemoryTransport({
      chunks: [
        `data: ${JSON.stringify({ type: "error", message: "AI-side" })}\n\n`,
      ],
    });
    const cache = createInMemoryCache();
    const onError = vi.fn();

    const result = await runAIInsight({
      build: build(),
      transport,
      cache,
      signal: new AbortController().signal,
      onError,
    });

    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledWith("AI-side");
  });

  it("reports 'no results' when the stream finishes without rows", async () => {
    const transport = createInMemoryTransport({ chunks: ["data: [DONE]\n\n"] });
    const cache = createInMemoryCache();
    const onError = vi.fn();

    const result = await runAIInsight({
      build: build(),
      transport,
      cache,
      signal: new AbortController().signal,
      onError,
    });

    expect(result).toBeNull();
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toContain("תוצאות");
  });

  it("aborts mid-stream without writing partial rows to cache", async () => {
    const row: InsightRow = {
      subject: "partial",
      recommendation: "x",
      status: "red",
    };
    const transport = createInMemoryTransport({
      chunks: [sseBlock(row), sseBlock(row)],
      delayMs: 0,
    });
    const cache = createInMemoryCache();
    const controller = new AbortController();

    const promise = runAIInsight({
      build: build(),
      transport,
      cache,
      signal: controller.signal,
    });
    controller.abort();
    const result = await promise;

    expect(result).toBeNull();
    expect(cache.get("test:1")).toBeNull();
  });
});
