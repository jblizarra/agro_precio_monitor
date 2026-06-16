import type { ProducerPrice, ProducerProfile, Product, RetailerPrice, ScrapeRun } from "@/lib/types";

export const products: Product[] = [
  {
    id: "tomate-pera",
    name: "Tomate pera",
    category: "Hortalizas",
    baseUnit: "kg",
    aliases: ["tomate pera granel", "tomate pera categoria i", "tomate ensalada pera"]
  },
  {
    id: "patata-lavada",
    name: "Patata lavada",
    category: "Tuberculos",
    baseUnit: "kg",
    aliases: ["patata nueva lavada", "patata malla", "patata blanca"]
  },
  {
    id: "leche-entera",
    name: "Leche entera",
    category: "Lacteos",
    baseUnit: "L",
    aliases: ["leche entera brik", "leche entera uht", "leche vaca entera"]
  },
  {
    id: "aceite-oliva-virgen-extra",
    name: "Aceite oliva virgen extra",
    category: "Aceites",
    baseUnit: "L",
    aliases: ["aove", "aceite virgen extra", "aceite oliva virgen extra botella"]
  },
  {
    id: "naranja-mesa",
    name: "Naranja mesa",
    category: "Fruta",
    baseUnit: "kg",
    aliases: ["naranja para mesa", "naranja granel", "naranja zumo mesa"]
  }
];

export const producerProfiles: ProducerProfile[] = [
  {
    id: "producer-1",
    userId: "demo-producer",
    displayName: "Cooperativa Vega Baja",
    province: "Valencia",
    productionType: "Hortalizas y citricos",
    verified: true
  },
  {
    id: "producer-2",
    userId: "demo-olive",
    displayName: "Olivar Sierra Sur",
    province: "Jaen",
    productionType: "Aceite",
    verified: true
  }
];

export const retailerPrices: RetailerPrice[] = [
  {
    id: "rp-1",
    productId: "tomate-pera",
    retailer: "Mercadona",
    sourceName: "Mercadona web",
    sourceUrl: "https://www.mercadona.es/",
    originalPrice: 2.29,
    originalUnitLabel: "1 kg",
    packageSize: 1,
    packageUnit: "kg",
    normalizedPrice: 2.29,
    capturedAt: "2026-06-16T08:40:00.000Z"
  },
  {
    id: "rp-2",
    productId: "tomate-pera",
    retailer: "Carrefour",
    sourceName: "Carrefour web",
    sourceUrl: "https://www.carrefour.es/",
    originalPrice: 2.49,
    originalUnitLabel: "1 kg",
    packageSize: 1,
    packageUnit: "kg",
    normalizedPrice: 2.49,
    capturedAt: "2026-06-16T08:55:00.000Z"
  },
  {
    id: "rp-3",
    productId: "tomate-pera",
    retailer: "Dia",
    sourceName: "Dia web",
    sourceUrl: "https://www.dia.es/",
    originalPrice: 2.35,
    originalUnitLabel: "1 kg",
    packageSize: 1,
    packageUnit: "kg",
    normalizedPrice: 2.35,
    capturedAt: "2026-06-16T09:10:00.000Z"
  },
  {
    id: "rp-4",
    productId: "patata-lavada",
    retailer: "Mercadona",
    sourceName: "Mercadona web",
    sourceUrl: "https://www.mercadona.es/",
    originalPrice: 1.59,
    originalUnitLabel: "1 kg",
    packageSize: 1,
    packageUnit: "kg",
    normalizedPrice: 1.59,
    capturedAt: "2026-06-16T08:40:00.000Z"
  },
  {
    id: "rp-5",
    productId: "patata-lavada",
    retailer: "Dia",
    sourceName: "Dia web",
    sourceUrl: "https://www.dia.es/",
    originalPrice: 1.79,
    originalUnitLabel: "1 kg",
    packageSize: 1,
    packageUnit: "kg",
    normalizedPrice: 1.79,
    capturedAt: "2026-06-16T09:10:00.000Z"
  },
  {
    id: "rp-6",
    productId: "leche-entera",
    retailer: "Carrefour",
    sourceName: "Carrefour web",
    sourceUrl: "https://www.carrefour.es/",
    originalPrice: 0.98,
    originalUnitLabel: "1 L",
    packageSize: 1,
    packageUnit: "L",
    normalizedPrice: 0.98,
    capturedAt: "2026-06-16T08:55:00.000Z"
  },
  {
    id: "rp-7",
    productId: "aceite-oliva-virgen-extra",
    retailer: "Mercadona",
    sourceName: "Mercadona web",
    sourceUrl: "https://www.mercadona.es/",
    originalPrice: 9.85,
    originalUnitLabel: "1 L",
    packageSize: 1,
    packageUnit: "L",
    normalizedPrice: 9.85,
    capturedAt: "2026-06-16T08:40:00.000Z"
  },
  {
    id: "rp-8",
    productId: "naranja-mesa",
    retailer: "Dia",
    sourceName: "Dia web",
    sourceUrl: "https://www.dia.es/",
    originalPrice: 1.99,
    originalUnitLabel: "1 kg",
    packageSize: 1,
    packageUnit: "kg",
    normalizedPrice: 1.99,
    capturedAt: "2026-06-16T09:10:00.000Z"
  }
];

export const producerPrices: ProducerPrice[] = [
  {
    id: "pp-1",
    productId: "tomate-pera",
    producerId: "producer-1",
    normalizedPrice: 0.72,
    unit: "kg",
    province: "Valencia",
    effectiveDate: "2026-06-15",
    notes: "Precio medio de cooperativa para tomate pera de primera.",
    status: "approved",
    createdAt: "2026-06-15T10:20:00.000Z"
  },
  {
    id: "pp-2",
    productId: "aceite-oliva-virgen-extra",
    producerId: "producer-2",
    normalizedPrice: 5.92,
    unit: "L",
    province: "Jaen",
    effectiveDate: "2026-06-14",
    notes: "AOVE a granel, campana actual.",
    status: "approved",
    createdAt: "2026-06-14T12:10:00.000Z"
  },
  {
    id: "pp-3",
    productId: "patata-lavada",
    producerId: "producer-1",
    normalizedPrice: 0.38,
    unit: "kg",
    province: "Castilla y Leon",
    effectiveDate: "2026-06-15",
    notes: "Pendiente de validar origen y lote.",
    status: "pending",
    createdAt: "2026-06-15T18:45:00.000Z"
  }
];

export const scrapeRuns: ScrapeRun[] = [
  {
    id: "run-1",
    retailer: "Mercadona",
    status: "success",
    startedAt: "2026-06-16T08:39:00.000Z",
    finishedAt: "2026-06-16T08:40:00.000Z",
    message: "Captura demo completada.",
    insertedRows: 3
  },
  {
    id: "run-2",
    retailer: "Carrefour",
    status: "success",
    startedAt: "2026-06-16T08:54:00.000Z",
    finishedAt: "2026-06-16T08:55:00.000Z",
    message: "Captura demo completada.",
    insertedRows: 2
  },
  {
    id: "run-3",
    retailer: "Dia",
    status: "success",
    startedAt: "2026-06-16T09:09:00.000Z",
    finishedAt: "2026-06-16T09:10:00.000Z",
    message: "Captura demo completada.",
    insertedRows: 3
  }
];
