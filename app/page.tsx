import { PriceDashboard } from "@/components/PriceDashboard";
import { getComparisonRows } from "@/lib/data";

export default async function HomePage() {
  const rows = await getComparisonRows();

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Seguimiento de precios alimentarios</p>
          <h1>Comparador entre lineal de supermercado y precio de productor</h1>
        </div>
        <a className="button" href="/producer">Publicar precio</a>
      </header>
      <PriceDashboard rows={rows} />
    </>
  );
}
