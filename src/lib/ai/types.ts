// Public types shared across the AI engine. Kept in one file so the
// engine's boundary contract is easy to audit.

/** Single row in an AI briefing, regardless of which surface it targets. */
export interface InsightRow {
  subject: string;
  recommendation: string;
  status: "red" | "yellow" | "green";
  entity?: {
    type: "supplier" | "category" | "promotion";
    name: string;
    href: string;
  };
}

/** Output shape stored in cache. One row per insight. */
export interface AIInsightResult {
  rows: InsightRow[];
}

/**
 * State-machine phases. The existing UI only distinguishes
 * `isLoading`/`isStreaming`/`error`; we expose a richer `phase`
 * internally and derive those booleans at the hook boundary so the
 * existing briefing components don't have to change.
 */
export type AIPhase = "idle" | "loading" | "streaming" | "success" | "error";

/**
 * The shape every builder must return. `cacheKey` scopes the cache
 * entry per-surface so a store-id and category-id collision can't
 * happen. `payload` is what the server sees; `systemPrompt` and
 * `userPrompt` are forwarded verbatim to the Netlify function.
 */
export interface AIBuildResult<TPayload> {
  cacheKey: string;
  payload: TPayload;
  systemPrompt: string;
  userPrompt: string;
}

/** Named builder identity used by the registry. */
export type AIBuilderId = "store" | "category" | "chain";
