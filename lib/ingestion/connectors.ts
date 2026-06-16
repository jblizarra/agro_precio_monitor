import { matchProduct } from "@/lib/matching";
import { normalizePrice } from "@/lib/pricing";
import { products } from "@/lib/sample-data";
import type { Retailer, RetailerPrice, Unit } from "@/lib/types";

export type RawRetailerProduct = {
  rawName: string;
  retailer: Retailer;
  sourceName: string;
  sourceUrl: string;
  price: number;
  packageSize: number;
  packageUnit: Unit;
  originalUnitLabel: string;
};

export type RetailerConnector = {
  retailer: Retailer;
  complianceNote: string;
  fetchProducts: () => Promise<RawRetailerProduct[]>;
};

export const connectors: RetailerConnector[] = [
  {
    retailer: "Mercadona",
    complianceNote: "Preferir API/endpoints publicos documentados. Scraping HTML solo si robots.txt y terminos lo permiten.",
    fetchProducts: async () => [
      demoRaw("Mercadona", "Tomate pera granel", 2.29, "kg", "1 kg", "https://www.mercadona.es/"),
      demoRaw("Mercadona", "Patata nueva lavada", 1.59, "kg", "1 kg", "https://www.mercadona.es/"),
      demoRaw("Mercadona", "Aceite virgen extra", 9.85, "L", "1 L", "https://www.mercadona.es/")
    ]
  },
  {
    retailer: "Carrefour",
    complianceNote: "Usar feed o API si esta disponible; mantener rate limit conservador.",
    fetchProducts: async () => [
      demoRaw("Carrefour", "Tomate pera categoria i", 2.49, "kg", "1 kg", "https://www.carrefour.es/"),
      demoRaw("Carrefour", "Leche entera brik", 0.98, "L", "1 L", "https://www.carrefour.es/")
    ]
  },
  {
    retailer: "Dia",
    complianceNote: "Conector preparado para API o scraping permitido con trazabilidad de URL.",
    fetchProducts: async () => [
      demoRaw("Dia", "Tomate pera granel", 2.35, "kg", "1 kg", "https://www.dia.es/"),
      demoRaw("Dia", "Patata malla", 1.79, "kg", "1 kg", "https://www.dia.es/"),
      demoRaw("Dia", "Naranja para mesa", 1.99, "kg", "1 kg", "https://www.dia.es/")
    ]
  }
];

export async function runConnector(connector: RetailerConnector): Promise<RetailerPrice[]> {
  const rawRows = await connector.fetchProducts();
  const now = new Date().toISOString();

  return rawRows.flatMap((raw, index) => {
    const product = matchProduct(raw.rawName, products);
    if (!product) return [];

    return [{
      id: `${raw.retailer.toLowerCase()}-${product.id}-${Date.now()}-${index}`,
      productId: product.id,
      retailer: raw.retailer,
      sourceName: raw.sourceName,
      sourceUrl: raw.sourceUrl,
      originalPrice: raw.price,
      originalUnitLabel: raw.originalUnitLabel,
      packageSize: raw.packageSize,
      packageUnit: raw.packageUnit,
      normalizedPrice: normalizePrice(raw.price, raw.packageSize, raw.packageUnit),
      capturedAt: now
    }];
  });
}

function demoRaw(
  retailer: Retailer,
  rawName: string,
  price: number,
  unit: Unit,
  originalUnitLabel: string,
  sourceUrl: string
): RawRetailerProduct {
  return {
    rawName,
    retailer,
    sourceName: `${retailer} demo connector`,
    sourceUrl,
    price,
    packageSize: 1,
    packageUnit: unit,
    originalUnitLabel
  };
}
