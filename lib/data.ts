import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildComparisonRows, newestRetailerPrices } from "@/lib/pricing";
import { producerPrices, producerProfiles, products, retailerPrices, scrapeRuns } from "@/lib/sample-data";
import type { ComparisonRow, ProducerPrice, Product, RetailerPrice, ScrapeRun } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return products;

  const { data, error } = await supabase.from("products").select("*").order("name");
  if (error || !data) return products;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    baseUnit: row.base_unit,
    aliases: row.aliases ?? []
  }));
}

export async function getRetailerPrices(): Promise<RetailerPrice[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return retailerPrices;

  const { data, error } = await supabase
    .from("retailer_prices")
    .select("*")
    .order("captured_at", { ascending: false });

  if (error || !data) return retailerPrices;

  return data.map((row) => ({
    id: row.id,
    productId: row.product_id,
    retailer: row.retailer,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    originalPrice: Number(row.original_price),
    originalUnitLabel: row.original_unit_label,
    packageSize: Number(row.package_size),
    packageUnit: row.package_unit,
    normalizedPrice: Number(row.normalized_price),
    capturedAt: row.captured_at
  }));
}

export async function getProducerPrices(status?: ProducerPrice["status"]): Promise<ProducerPrice[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return status ? producerPrices.filter((price) => price.status === status) : producerPrices;

  let query = supabase.from("producer_prices").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error || !data) return status ? producerPrices.filter((price) => price.status === status) : producerPrices;

  return data.map((row) => ({
    id: row.id,
    productId: row.product_id,
    producerId: row.producer_id,
    normalizedPrice: Number(row.normalized_price),
    unit: row.unit,
    province: row.province,
    effectiveDate: row.effective_date,
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.created_at
  }));
}

export async function getScrapeRuns(): Promise<ScrapeRun[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return scrapeRuns;

  const { data, error } = await supabase
    .from("scrape_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  if (error || !data) return scrapeRuns;

  return data.map((row) => ({
    id: row.id,
    retailer: row.retailer,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
    message: row.message ?? undefined,
    insertedRows: row.inserted_rows ?? 0
  }));
}

export async function getComparisonRows(): Promise<ComparisonRow[]> {
  const [allProducts, allRetailerPrices, approvedProducerPrices] = await Promise.all([
    getProducts(),
    getRetailerPrices(),
    getProducerPrices("approved")
  ]);

  const latestRetailerPrices = newestRetailerPrices(allRetailerPrices);
  const rows = latestRetailerPrices.map((retailerPrice) => {
    const product = allProducts.find((item) => item.id === retailerPrice.productId);
    if (!product) return undefined;

    const producerPrice = approvedProducerPrices
      .filter((price) => price.productId === product.id)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
    const producer = producerPrice ? producerProfiles.find((profile) => profile.id === producerPrice.producerId) : undefined;

    return {
      product,
      retailerPrice,
      producerPrice,
      producerName: producer?.displayName
    };
  }).filter(Boolean) as ComparisonRow[];

  return buildComparisonRows(rows);
}

export async function getCurrentUserRole(): Promise<"viewer" | "producer" | "admin"> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return "admin";

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return "viewer";

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  return data?.role ?? "viewer";
}
