import { describe, expect, it } from "vitest";
import { calculateDifference, calculateMargin, normalizePrice, validateProducerPrice } from "@/lib/pricing";

describe("pricing", () => {
  it("normalizes prices to kg or L", () => {
    expect(normalizePrice(2.5, 0.5, "kg")).toBe(5);
    expect(normalizePrice(1.2, 1.5, "L")).toBe(0.8);
  });

  it("calculates producer to retailer margin", () => {
    expect(calculateMargin(2.29, 0.72)).toBe(218.1);
    expect(calculateDifference(2.29, 0.72)).toBe(1.57);
  });

  it("rejects invalid producer prices", () => {
    const errors = validateProducerPrice({
      productId: "",
      normalizedPrice: 0,
      unit: "kg",
      province: "",
      effectiveDate: "not-a-date"
    });

    expect(errors).toContain("Selecciona un producto.");
    expect(errors).toContain("Introduce un precio mayor que cero.");
    expect(errors).toContain("Introduce una provincia valida.");
    expect(errors).toContain("Introduce una fecha valida.");
  });
});
