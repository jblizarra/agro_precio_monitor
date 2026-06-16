import { submitProducerPrice } from "@/app/actions";
import { getProducerPrices, getProducts } from "@/lib/data";
import { euroFormatter, formatDate } from "@/lib/format";

type Props = {
  searchParams: { error?: string; success?: string };
};

export default async function ProducerPage({ searchParams }: Props) {
  const [allProducts, myPrices] = await Promise.all([getProducts(), getProducerPrices()]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Panel productor</p>
          <h1>Publica precios de produccion para revision</h1>
        </div>
      </header>

      {searchParams.error ? <div className="status rejected">{searchParams.error}</div> : null}
      {searchParams.success ? <div className="status approved">Precio recibido para revision</div> : null}

      <section className="form-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Nuevo precio</p>
            <h2>Precio productor normalizado</h2>
          </div>
        </div>
        <form className="form-grid" action={submitProducerPrice}>
          <label>
            Producto
            <select name="productId" required>
              {allProducts.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.name} ({product.baseUnit})
                </option>
              ))}
            </select>
          </label>
          <label>
            Precio normalizado
            <input name="normalizedPrice" type="number" step="0.01" min="0.01" placeholder="0.72" required />
          </label>
          <label>
            Unidad
            <select name="unit" required>
              <option value="kg">€/kg</option>
              <option value="L">€/L</option>
            </select>
          </label>
          <label>
            Provincia
            <input name="province" placeholder="Valencia" required />
          </label>
          <label>
            Fecha efectiva
            <input name="effectiveDate" type="date" required />
          </label>
          <label className="full">
            Notas
            <textarea name="notes" placeholder="Origen, lote, lonja o condicion relevante" />
          </label>
          <div className="actions full">
            <button type="submit">Enviar a revision</button>
          </div>
        </form>
      </section>

      <section className="table-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Historial</p>
            <h2>Precios enviados</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Provincia</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {myPrices.map((price) => {
                const product = allProducts.find((item) => item.id === price.productId);
                return (
                  <tr key={price.id}>
                    <td>{product?.name ?? price.productId}</td>
                    <td>{euroFormatter.format(price.normalizedPrice)}/{price.unit}</td>
                    <td>{price.province}</td>
                    <td>{formatDate(price.effectiveDate)}</td>
                    <td><span className={`status ${price.status}`}>{price.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
