import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { OverviewDepartmentBars } from "../OverviewDepartmentBars";
import { mockDepartments } from "./mocks";

describe("OverviewDepartmentBars", () => {
  it("renders each department in sorted order", () => {
    const html = renderToString(
      createElement(OverviewDepartmentBars, { departments: mockDepartments })
    );
    expect(html).toContain("נתח מכירות לפי מחלקה");
    for (const d of mockDepartments) {
      expect(html).toContain(d.name);
    }
  });
});
