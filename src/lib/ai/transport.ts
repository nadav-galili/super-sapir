// Transport port + adapters.
//
// The production adapter calls the existing Netlify function at
// `/.netlify/functions/ai-analyze` and returns a ReadableStream of
// UTF-8 bytes. The in-memory adapter yields raw SSE-formatted strings
// deterministically from a queue, which lets the engine test cover
// the full lifecycle without a real network or DOM streaming APIs.

export interface TransportRequest<TPayload> {
  payload: TPayload;
  systemPrompt: string;
  userPrompt: string;
  signal: AbortSignal;
}

/** The transport only has to produce an async iterable of text chunks. */
export interface AITransport {
  send<TPayload>(
    req: TransportRequest<TPayload>
  ): Promise<AsyncIterable<string>>;
}

/** Default production adapter — HTTP POST + SSE stream over fetch. */
export const httpSseTransport: AITransport = {
  async send<TPayload>(req: TransportRequest<TPayload>) {
    const response = await fetch("/.netlify/functions/ai-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: req.payload,
        systemPrompt: req.systemPrompt,
        userPrompt: req.userPrompt,
      }),
      signal: req.signal,
    });

    if (!response.ok) {
      const err = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error ?? `HTTP ${response.status}`);
    }
    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    async function* iterate() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (req.signal.aborted) break;
          yield decoder.decode(value, { stream: true });
        }
      } finally {
        try {
          reader.releaseLock();
        } catch {
          // Already released.
        }
      }
    }

    return iterate();
  },
};

/**
 * In-memory adapter — takes a static list of SSE-formatted chunks
 * (each chunk may contain several `data: ...\n\n` blocks) and yields
 * them one at a time when the engine asks for them.
 *
 * If `error` is set, the adapter throws that error once (used to
 * exercise retry paths). `delayMs` inserts a microtask gap between
 * chunks so the streaming phase is observable.
 */
export function createInMemoryTransport(options: {
  chunks: string[];
  error?: Error;
  delayMs?: number;
}): AITransport {
  let remainingErrors = options.error ? 1 : 0;
  return {
    async send() {
      if (remainingErrors > 0) {
        remainingErrors -= 1;
        throw options.error;
      }
      const chunks = [...options.chunks];
      async function* iterate() {
        for (const chunk of chunks) {
          if (options.delayMs != null) {
            await new Promise((r) => setTimeout(r, options.delayMs));
          }
          yield chunk;
        }
      }
      return iterate();
    },
  };
}
