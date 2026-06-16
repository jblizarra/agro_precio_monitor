export type Unit = "kg" | "L";
export type UserRole = "viewer" | "producer" | "admin";
export type ProducerPriceStatus = "pending" | "approved" | "rejected";
export type Retailer = "Mercadona" | "Carrefour" | "Dia";
export type CaptureStatus = "success" | "failed" | "skipped";

export type Product = {
  id: string;
  name: string;
  category: string;
  baseUnit: Unit;
  aliases: string[];
};

export type RetailerPrice = {
  id: string;
  productId: string;
  retailer: Retailer;
  sourceName: string;
  sourceUrl: string;
  originalPrice: number;
  originalUnitLabel: string;
  packageSize: number;
  packageUnit: Unit;
  normalizedPrice: number;
  capturedAt: string;
};

export type ProducerProfile = {
  id: string;
  userId: string;
  displayName: string;
  province: string;
  productionType: string;
  verified: boolean;
};

export type ProducerPrice = {
  id: string;
  productId: string;
  producerId: string;
  normalizedPrice: number;
  unit: Unit;
  province: string;
  effectiveDate: string;
  notes?: string;
  status: ProducerPriceStatus;
  createdAt: string;
};

export type ScrapeRun = {
  id: string;
  retailer: Retailer;
  status: CaptureStatus;
  startedAt: string;
  finishedAt?: string;
  message?: string;
  insertedRows: number;
};

export type ComparisonRow = {
  product: Product;
  retailerPrice: RetailerPrice;
  producerPrice?: ProducerPrice;
  producerName?: string;
  absoluteDifference?: number;
  marginPercent?: number;
};

export type ProducerPriceInput = {
  productId: string;
  normalizedPrice: number;
  unit: Unit;
  province: string;
  effectiveDate: string;
  notes?: string;
};
