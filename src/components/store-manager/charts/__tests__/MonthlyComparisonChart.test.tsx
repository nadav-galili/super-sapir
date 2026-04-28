import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { MonthlyComparisonChart } from "../MonthlyComparisonChart";
import { mockMonthly } from "./mocks";

const annualLastYear = mockMonthly.reduce((s, m) => s + m.lastYearSales, 0);
const annualTarget = annualLastYear * 1.05;

describe("MonthlyComparisonChart", () => {
  it("renders to string without throwing", () => {
    const html = renderToString(
      createElement(MonthlyComparisonChart, {
        data: mockMonthly,
        annualTarget,
        annualLastYear,
      })
    );
    expect(typeof html).toBe("string");
  });

  it("includes the title label and year badge", () => {
    const html = renderToString(
      createElement(MonthlyComparisonChart, {
        data: mockMonthly,
        annualTarget,
        annualLastYear,
      })
    );
    expect(html).toContain("מגמת מכירות");
  });
});
