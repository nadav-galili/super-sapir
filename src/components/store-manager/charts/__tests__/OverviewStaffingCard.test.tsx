import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { OverviewStaffingCard } from "../OverviewStaffingCard";
import { mockHr } from "./mocks";

describe("OverviewStaffingCard", () => {
  it("renders the tile labels and turnover chart container", () => {
    const html = renderToString(
      createElement(OverviewStaffingCard, { hr: mockHr })
    );
    expect(html).toContain("כוח אדם ותחלופה");
    expect(html).toContain("תקן");
    expect(html).toContain("מצבה רישומית");
    expect(html).toContain("משרות בפועל");
    expect(html).toContain("שעות נוספות");
    expect(html).toContain("תחלופת עובדים");
  });
});
