import { describe, expect, it } from "vitest";
import { connectors, runConnector } from "@/lib/ingestion/connectors";

describe("ingestion connectors", () => {
  it("normalizes demo connector rows", async () => {
    const mercadona = connectors.find((connector) => connector.retailer === "Mercadona");
    expect(mercadona).toBeDefined();

    const rows = await runConnector(mercadona!);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toMatchObject({
      retailer: "Mercadona",
      normalizedPrice: expect.any(Number),
      sourceUrl: expect.stringContaining("mercadona")
    });
  });
});
