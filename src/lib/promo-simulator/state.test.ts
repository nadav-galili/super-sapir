import { describe, it, expect } from "vitest";
import {
  createDefaultState,
  decodeState,
  encodeState,
  validateSimulatorSearch,
} from "./state";

describe("simulator state — promo-taxonomy URL params", () => {
  it("createDefaultState seeds the new taxonomy fields as empty strings", () => {
    const s = createDefaultState();
    expect(s.group).toBe("");
    expect(s.department).toBe("");
    expect(s.subcategory).toBe("");
    expect(s.supplier).toBe("");
    expect(s.series).toBe("");
  });

  it("validateSimulatorSearch coerces the new taxonomy params to strings", () => {
    const out = validateSimulatorSearch({
      group: "grocery",
      department: "drinks",
      subcategory: "tea",
      supplier: "sup-22",
      series: "תה ירוק",
    });
    expect(out.group).toBe("grocery");
    expect(out.department).toBe("drinks");
    expect(out.subcategory).toBe("tea");
    expect(out.supplier).toBe("sup-22");
    expect(out.series).toBe("תה ירוק");
  });

  it("encodeState omits taxonomy fields when they equal defaults", () => {
    const defaults = createDefaultState();
    const out = encodeState(defaults, defaults);
    expect(out.group).toBeUndefined();
    expect(out.department).toBeUndefined();
    expect(out.subcategory).toBeUndefined();
    expect(out.supplier).toBeUndefined();
    expect(out.series).toBeUndefined();
  });

  it("encodeState includes taxonomy fields when set, and decodeState round-trips them", () => {
    const defaults = createDefaultState();
    const next = {
      ...defaults,
      group: "dairy",
      department: "white-cheese",
      subcategory: "feta",
      supplier: "sup-01",
      series: "פטה תנובה",
    };

    const encoded = encodeState(next, defaults);
    expect(encoded.group).toBe("dairy");
    expect(encoded.department).toBe("white-cheese");
    expect(encoded.subcategory).toBe("feta");
    expect(encoded.supplier).toBe("sup-01");
    expect(encoded.series).toBe("פטה תנובה");

    const decoded = decodeState(encoded, defaults);
    expect(decoded.group).toBe("dairy");
    expect(decoded.department).toBe("white-cheese");
    expect(decoded.subcategory).toBe("feta");
    expect(decoded.supplier).toBe("sup-01");
    expect(decoded.series).toBe("פטה תנובה");
  });

  it("decodeState falls back to defaults for missing taxonomy params", () => {
    const defaults = createDefaultState();
    const decoded = decodeState({}, defaults);
    expect(decoded.group).toBe(defaults.group);
    expect(decoded.supplier).toBe(defaults.supplier);
    expect(decoded.series).toBe(defaults.series);
  });
});
