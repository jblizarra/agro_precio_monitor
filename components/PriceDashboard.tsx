import { euroFormatter, formatDate, percentFormatter } from "@/lib/format";
import type { ComparisonRow } from "@/lib/types";

type Props = {
  rows: ComparisonRow[];
};

export function PriceDashboard({ rows }: Props) {
  const rowsWithProducer = rows.filter((row) => row.producerPrice);
  const avgMargin = rowsWithProducer.length
    ? rowsWithProducer.reduce((sum, row) => sum + (row.marginPercent ?? 0), 0) / rowsWithProducer.length
    : 0;
  const alertCount = rowsWithProducer.filter((row) => (row.marginPercent ?? 0) >= 200).length;
  const maxPrice = Math.max(...rows.map((row) => row.retailerPrice.normalizedPrice), 1);

  return (
    <div className="grid">
      <section className="metrics" aria-label="Indicadores principales">
        <article className="metric">
          <span>Productos</span>
          <strong>{new Set(rows.map((row) => row.product.id)).size}</strong>
          <small>referencias vigiladas</small>
        </article>
        <article className="metric">
          <span>Supermercados</span>
          <strong>{new Set(rows.map((row) => row.retailerPrice.retailer)).size}</strong>
          <small>cadenas comparadas</small>
        </article>
        <article className="metric warning">
          <span>Margen medio</span>
          <strong>{percentFormatter.format(avgMargin)}%</strong>
          <small>sobre precio productor aprobado</small>
        </article>
        <article className="metric danger">
          <span>Alertas</span>
          <strong>{alertCount}</strong>
          <small>margenes superiores al 200%</small>
        </article>
      </section>

      <section className="comparison-grid">
        <article className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Comparacion actual</p>
              <h2>Precio normalizado por kg o litro</h2>
            </div>
            <span className="muted">{rows.length} registros</span>
          </div>
          <div className="bars">
            {rows.slice(0, 8).map((row) => {
              const retailerWidth = (row.retailerPrice.normalizedPrice / maxPrice) * 100;
              const producerWidth = row.producerPrice ? (row.producerPrice.normalizedPrice / maxPrice) * 100 : 0;

              return (
                <div className="bar-row" key={row.retailerPrice.id}>
                  <div className="bar-label">
                    {row.product.name}
                    <br />
                    <small>{row.retailerPrice.retailer}</small>
                  </div>
                  <div>
                    <div className="bar-track" title="Precio supermercado">
                      <div className="bar-fill" style={{ width: `${retailerWidth}%` }} />
                    </div>
                    {row.producerPrice ? (
                      <div className="bar-track" title="Precio productor">
                        <div className="bar-fill origin" style={{ width: `${producerWidth}%` }} />
                      </div>
                    ) : null}
                  </div>
                  <div className="bar-value">
                    {euroFormatter.format(row.retailerPrice.normalizedPrice)}
                    <br />
                    <small>{row.producerPrice ? euroFormatter.format(row.producerPrice.normalizedPrice) : "sin origen"}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Lectura rapida</p>
              <h2>Brecha origen-lineal</h2>
            </div>
          </div>
          <div className="insight-list">
            {rowsWithProducer
              .sort((a, b) => (b.marginPercent ?? 0) - (a.marginPercent ?? 0))
              .slice(0, 3)
              .map((row) => (
                <div className="insight" key={`${row.product.id}-${row.retailerPrice.retailer}`}>
                  <strong>{row.product.name}</strong>
                  <span className="muted">
                    {row.retailerPrice.retailer}: {percentFormatter.format(row.marginPercent ?? 0)}% sobre origen.
                  </span>
                </div>
              ))}
          </div>
        </article>
      </section>

      <section className="table-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Detalle operativo</p>
            <h2>Productos monitorizados</h2>
          </div>
          <span className="muted">Actualizado con ultimas capturas</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Supermercado</th>
                <th>Lineal</th>
                <th>Productor</th>
                <th>Diferencia</th>
                <th>Margen</th>
                <th>Captura</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.retailerPrice.id}>
                  <td>
                    <strong>{row.product.name}</strong>
                    <br />
                    <small>{row.product.category}</small>
                  </td>
                  <td>{row.retailerPrice.retailer}</td>
                  <td>{euroFormatter.format(row.retailerPrice.normalizedPrice)}/{row.product.baseUnit}</td>
                  <td>
                    {row.producerPrice ? (
                      <>
                        {euroFormatter.format(row.producerPrice.normalizedPrice)}/{row.product.baseUnit}
                        <br />
                        <small>{row.producerName}</small>
                      </>
                    ) : (
                      <span className="muted">Sin precio aprobado</span>
                    )}
                  </td>
                  <td>{row.absoluteDifference !== undefined ? euroFormatter.format(row.absoluteDifference) : "-"}</td>
                  <td>{row.marginPercent !== undefined ? `${percentFormatter.format(row.marginPercent)}%` : "-"}</td>
                  <td>{formatDate(row.retailerPrice.capturedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
