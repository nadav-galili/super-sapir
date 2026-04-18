import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { BranchPerformanceCard } from "../BranchPerformanceCard";
import { mockReport } from "./mocks";

describe("BranchPerformanceCard", () => {
  it("renders the section title and 4 tiles", () => {
    const html = renderToString(
      createElement(BranchPerformanceCard, { report: mockReport })
    );
    expect(html).toContain("ביצועי סניף");
    expect(html).toContain("% יישום משימות בEyedo");
    expect(html).toContain("פריון לשעת עבודה");
  });
});
