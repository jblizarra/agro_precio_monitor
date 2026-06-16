import { reviewProducerPrice } from "@/app/actions";
import { getProducerPrices, getProducts, getScrapeRuns } from "@/lib/data";
import { euroFormatter, formatDate } from "@/lib/format";

type Props = {
  searchParams: { error?: string; success?: string };
};

export default async function AdminPage({ searchParams }: Props) {
  const [allProducts, pendingPrices, runs] = await Promise.all([
    getProducts(),
    getProducerPrices("pending"),
    getScrapeRuns()
  ]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Revision de productores y salud de scraping</h1>
        </div>
      </header>

      {searchParams.error ? <div className="status rejected">{searchParams.error}</div> : null}
      {searchParams.success ? <div className="status approved">Accion aplicada</div> : null}

      <section className="table-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Moderacion</p>
            <h2>Precios pendientes</h2>
          </div>
          <span className="muted">{pendingPrices.length} solicitudes</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Provincia</th>
                <th>Fecha</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendingPrices.map((price) => {
                const product = allProducts.find((item) => item.id === price.productId);
                return (
                  <tr key={price.id}>
                    <td>{product?.name ?? price.productId}</td>
                    <td>{euroFormatter.format(price.normalizedPrice)}/{price.unit}</td>
                    <td>{price.province}</td>
                    <td>{formatDate(price.effectiveDate)}</td>
                    <td>{price.notes ?? "-"}</td>
                    <td>
                      <div className="actions">
                        <form action={reviewProducerPrice}>
                          <input type="hidden" name="id" value={price.id} />
                          <input type="hidden" name="status" value="approved" />
                          <button type="submit">Aprobar</button>
                        </form>
                        <form action={reviewProducerPrice}>
                          <input type="hidden" name="id" value={price.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button className="danger" type="submit">Rechazar</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="table-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Ingesta</p>
            <h2>Ultimas capturas</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cadena</th>
                <th>Estado</th>
                <th>Filas</th>
                <th>Inicio</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>{run.retailer}</td>
                  <td><span className={`status ${run.status}`}>{run.status}</span></td>
                  <td>{run.insertedRows}</td>
                  <td>{formatDate(run.startedAt)}</td>
                  <td>{run.message ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
