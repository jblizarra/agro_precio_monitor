import type { ComparisonRow, ProducerPriceInput, RetailerPrice, Unit } from "@/lib/types";

export function normalizePrice(price: number, packageSize: number, packageUnit: Unit): number {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("El precio debe ser mayor que cero.");
  }

  if (!Number.isFinite(packageSize) || packageSize <= 0) {
    throw new Error("El tamano del envase debe ser mayor que cero.");
  }

  if (packageUnit !== "kg" && packageUnit !== "L") {
    throw new Error("La unidad debe ser kg o L.");
  }

  return roundMoney(price / packageSize);
}

export function calculateMargin(retailerPrice: number, producerPrice: number): number {
  if (!Number.isFinite(retailerPrice) || !Number.isFinite(producerPrice) || producerPrice <= 0) {
    throw new Error("Los precios deben ser validos y el precio productor mayor que cero.");
  }

  return roundPercent(((retailerPrice - producerPrice) / producerPrice) * 100);
}

export function calculateDifference(retailerPrice: number, producerPrice: number): number {
  return roundMoney(retailerPrice - producerPrice);
}

export function validateProducerPrice(input: ProducerPriceInput): string[] {
  const errors: string[] = [];

  if (!input.productId) errors.push("Selecciona un producto.");
  if (!Number.isFinite(input.normalizedPrice) || input.normalizedPrice <= 0) errors.push("Introduce un precio mayor que cero.");
  if (input.unit !== "kg" && input.unit !== "L") errors.push("Selecciona kg o L.");
  if (!input.province || input.province.trim().length < 2) errors.push("Introduce una provincia valida.");
  if (!input.effectiveDate || Number.isNaN(Date.parse(input.effectiveDate))) errors.push("Introduce una fecha valida.");

  return errors;
}

export function buildComparisonRows(rows: ComparisonRow[]): ComparisonRow[] {
  return rows.map((row) => {
    if (!row.producerPrice) return row;

    return {
      ...row,
      absoluteDifference: calculateDifference(row.retailerPrice.normalizedPrice, row.producerPrice.normalizedPrice),
      marginPercent: calculateMargin(row.retailerPrice.normalizedPrice, row.producerPrice.normalizedPrice)
    };
  });
}

export function newestRetailerPrices(prices: RetailerPrice[]): RetailerPrice[] {
  const latest = new Map<string, RetailerPrice>();

  for (const price of prices) {
    const key = `${price.productId}:${price.retailer}`;
    const current = latest.get(key);
    if (!current || new Date(price.capturedAt) > new Date(current.capturedAt)) {
      latest.set(key, price);
    }
  }

  return [...latest.values()].sort((a, b) => a.productId.localeCompare(b.productId) || a.retailer.localeCompare(b.retailer));
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}
