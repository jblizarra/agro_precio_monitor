import { PriceDashboard } from "@/components/PriceDashboard";
import { getComparisonRows } from "@/lib/data";

export default async function ComparatorPage() {
  const rows = await getComparisonRows();

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Comparador</p>
          <h1>Precios normalizados por cadena y materia prima</h1>
        </div>
      </header>
      <PriceDashboard rows={rows} />
    </>
  );
}
