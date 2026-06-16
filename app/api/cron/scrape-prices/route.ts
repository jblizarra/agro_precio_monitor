import { NextResponse } from "next/server";
import { connectors, runConnector } from "@/lib/ingestion/connectors";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const results = [];

  for (const connector of connectors) {
    const startedAt = new Date().toISOString();

    try {
      const prices = await runConnector(connector);

      if (supabase) {
        const { error: pricesError } = await supabase.from("retailer_prices").upsert(
          prices.map((price) => ({
            product_id: price.productId,
            retailer: price.retailer,
            source_name: price.sourceName,
            source_url: price.sourceUrl,
            original_price: price.originalPrice,
            original_unit_label: price.originalUnitLabel,
            package_size: price.packageSize,
            package_unit: price.packageUnit,
            normalized_price: price.normalizedPrice,
            captured_at: price.capturedAt
          })),
          { onConflict: "product_id,retailer,captured_at" }
        );

        if (pricesError) throw pricesError;

        await supabase.from("scrape_runs").insert({
          retailer: connector.retailer,
          status: "success",
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          inserted_rows: prices.length,
          message: connector.complianceNote
        });
      }

      results.push({
        retailer: connector.retailer,
        status: "success",
        rows: prices.length,
        complianceNote: connector.complianceNote
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      if (supabase) {
        await supabase.from("scrape_runs").insert({
          retailer: connector.retailer,
          status: "failed",
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          inserted_rows: 0,
          message
        });
      }

      results.push({
        retailer: connector.retailer,
        status: "failed",
        rows: 0,
        message
      });
    }
  }

  return NextResponse.json({
    ok: true,
    mode: supabase ? "supabase" : "dry-run",
    results
  });
}
