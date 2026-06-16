import type { Product } from "@/lib/types";

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchProduct(rawName: string, products: Product[]): Product | undefined {
  const normalizedRaw = normalizeSearchText(rawName);

  return products.find((product) => {
    const candidates = [product.name, ...product.aliases].map(normalizeSearchText);
    return candidates.some((candidate) => normalizedRaw === candidate || normalizedRaw.includes(candidate) || candidate.includes(normalizedRaw));
  });
}
