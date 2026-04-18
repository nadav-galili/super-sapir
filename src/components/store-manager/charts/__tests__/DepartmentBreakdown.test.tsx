import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { DepartmentBreakdown } from "../DepartmentBreakdown";
import { mockDepartments, mockAnomalies } from "./mocks";

describe("DepartmentBreakdown", () => {
  it("renders each department's name", () => {
    const html = renderToString(
      createElement(DepartmentBreakdown, { departments: mockDepartments })
    );
    for (const d of mockDepartments) {
      expect(html).toContain(d.name);
    }
  });

  it("still renders when anomalies are provided", () => {
    const html = renderToString(
      createElement(DepartmentBreakdown, {
        departments: mockDepartments,
        anomalies: mockAnomalies,
      })
    );
    expect(html).toContain("חלב-MOCK");
  });
});
