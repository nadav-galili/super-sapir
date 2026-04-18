import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { AlertsTargetsCard } from "../AlertsTargetsCard";
import { mockReport } from "./mocks";

describe("AlertsTargetsCard", () => {
  it("renders all 8 KPI rows with expected labels", () => {
    const html = renderToString(
      createElement(AlertsTargetsCard, { report: mockReport })
    );
    expect(html).toContain("התראות ויעדים");
    expect(html).toContain("אחוז עלות שכר");
    expect(html).toContain("מלאי גבוה");
    expect(html).toContain("חותמות אדומות");
    expect(html).toContain("חסרי פעילות");
    expect(html).toContain("חזרות");
    expect(html).toContain("פחת בשר");
    expect(html).toContain("תלונות לקוח");
  });
});
