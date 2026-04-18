import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { StaffingSection } from "../StaffingSection";
import { mockHr } from "./mocks";

describe("StaffingSection", () => {
  it("renders the title, summary tiles, and staffing rows", () => {
    const html = renderToString(createElement(StaffingSection, { hr: mockHr }));
    expect(html).toContain("כח אדם ומשרות");
    expect(html).toContain("תקן");
    expect(html).toContain("בפועל");
    expect(html).toContain("תחלופה");
    expect(html).toContain("צוות ניהולי-MOCK");
    expect(html).toContain("ירקות-MOCK");
  });
});
