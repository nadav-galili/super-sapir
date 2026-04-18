import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { InventoryByDepartmentChart } from "../InventoryByDepartmentChart";
import { mockDepartments } from "./mocks";

describe("InventoryByDepartmentChart", () => {
  it("renders the target badge and each department", () => {
    const html = renderToString(
      createElement(InventoryByDepartmentChart, {
        departments: mockDepartments,
        target: 14,
      })
    );
    expect(html).toContain("ימי מלאי ממוצע לפי מחלקה");
    expect(html).toContain("14");
    for (const d of mockDepartments) {
      expect(html).toContain(d.name);
    }
  });
});
