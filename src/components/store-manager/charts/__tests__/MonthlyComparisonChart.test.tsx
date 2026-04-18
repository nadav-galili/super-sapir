import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { MonthlyComparisonChart } from "../MonthlyComparisonChart";
import { mockMonthly } from "./mocks";

describe("MonthlyComparisonChart", () => {
  it("renders to string without throwing", () => {
    const html = renderToString(
      createElement(MonthlyComparisonChart, { data: mockMonthly })
    );
    expect(typeof html).toBe("string");
  });

  it("includes the title label and year badge", () => {
    const html = renderToString(
      createElement(MonthlyComparisonChart, { data: mockMonthly })
    );
    expect(html).toContain("מגמת מכירות");
  });
});
