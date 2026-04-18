import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { DepartmentMoversCard } from "../DepartmentMoversCard";
import { mockDepartments } from "./mocks";

describe("DepartmentMoversCard", () => {
  it("renders growers and decliners with YoY values", () => {
    const html = renderToString(
      createElement(DepartmentMoversCard, { departments: mockDepartments })
    );
    // "מכולת-MOCK" is a grower (+5.2), "חלב-MOCK" is a decliner (-8.1).
    expect(html).toContain("מכולת-MOCK");
    expect(html).toContain("חלב-MOCK");
    expect(html).toContain("ירידה");
    expect(html).toContain("צמיחה");
  });
});
