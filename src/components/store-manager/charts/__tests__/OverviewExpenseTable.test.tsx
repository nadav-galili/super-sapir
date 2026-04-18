import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { OverviewExpenseTable } from "../OverviewExpenseTable";
import { mockExpenses } from "./mocks";

describe("OverviewExpenseTable", () => {
  it("renders each expense name in the top-7", () => {
    const html = renderToString(
      createElement(OverviewExpenseTable, { expenses: mockExpenses })
    );
    for (const e of mockExpenses) {
      expect(html).toContain(e.name);
    }
  });
});
