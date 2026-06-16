import { describe, expect, it } from "vitest";
import { matchProduct, normalizeSearchText } from "@/lib/matching";
import { products } from "@/lib/sample-data";

describe("matching", () => {
  it("normalizes accents and punctuation", () => {
    expect(normalizeSearchText("Aceite Oliva Virgen Extra 1L")).toBe("aceite oliva virgen extra 1l");
  });

  it("matches retailer aliases with canonical products", () => {
    expect(matchProduct("Tomate pera categoria I", products)?.id).toBe("tomate-pera");
    expect(matchProduct("AOVE botella 1 L", products)?.id).toBe("aceite-oliva-virgen-extra");
    expect(matchProduct("producto desconocido", products)).toBeUndefined();
  });
});
