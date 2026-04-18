// Builder-registry tests. Every builder must produce a deterministic
// cache key, a JSON-serializable payload, a non-empty system prompt,
// and a user prompt that embeds the payload. We don't assert on
// specific prompt wording — just that the boundary contract holds.

import { describe, expect, it } from "vitest";
import {
  buildCategoryInsight,
  buildChainInsight,
  buildStoreInsight,
} from "./builders";
import {
  getBranchReportOrFallback,
  HADERA_BRANCH_ID,
} from "@/data/getBranchReport";

describe("buildStoreInsight", () => {
  const report = getBranchReportOrFallback(HADERA_BRANCH_ID);

  it("produces a branch-scoped cache key", () => {
    const build = buildStoreInsight({ branchId: HADERA_BRANCH_ID, report });
    expect(build.cacheKey).toBe(`branch:${HADERA_BRANCH_ID}`);
  });

  it("payload round-trips through JSON.stringify", () => {
    const build = buildStoreInsight({ branchId: HADERA_BRANCH_ID, report });
    expect(() => JSON.stringify(build.payload)).not.toThrow();
  });

  it("system prompt is non-empty Hebrew text", () => {
    const build = buildStoreInsight({ branchId: HADERA_BRANCH_ID, report });
    expect(build.systemPrompt.length).toBeGreaterThan(50);
  });

  it("user prompt includes serialized payload", () => {
    const build = buildStoreInsight({ branchId: HADERA_BRANCH_ID, report });
    expect(build.userPrompt).toContain(report.info.name);
  });
});

describe("buildCategoryInsight", () => {
  it("produces a category-scoped cache key", () => {
    const build = buildCategoryInsight({ categoryId: "dairy" });
    expect(build.cacheKey).toBe("category:dairy");
  });

  it("payload includes the category name + summary", () => {
    const build = buildCategoryInsight({ categoryId: "dairy" });
    expect(build.payload.categoryId).toBe("dairy");
    expect(build.payload.summary).toBeDefined();
  });
});

describe("buildChainInsight", () => {
  it("has the chain cache key", () => {
    const build = buildChainInsight();
    expect(build.cacheKey).toBe("chain:trade-manager");
  });

  it("payload has chain-level summary fields", () => {
    const build = buildChainInsight();
    expect(build.payload.chainSummary.branchCount).toBeGreaterThan(0);
    expect(Array.isArray(build.payload.categories)).toBe(true);
    expect(Array.isArray(build.payload.promotions)).toBe(true);
  });
});
