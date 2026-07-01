import { reviewProducerPrice, updateUserRoleAction } from "@/app/actions";
import { getProducerPrices, getProducts, getScrapeRuns, getCurrentUserRole, getAllProfiles } from "@/lib/data";
import { euroFormatter, formatDate } from "@/lib/format";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  searchParams: { error?: string; success?: string };
};

export default async function AdminPage({ searchParams }: Props) {
  const role = await getCurrentUserRole();
  if (role !== "admin") {
    redirect("/login");
  }

  const [allProducts, pendingPrices, runs, profiles] = await Promise.all([
    getProducts(),
    getProducerPrices("pending"),
    getScrapeRuns(),
    getAllProfiles()
  ]);

  const supabase = createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

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

      <section className="table-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Seguridad</p>
            <h2>Gestión de Usuarios</h2>
          </div>
          <span className="muted">{profiles.length} usuarios registrados</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol Actual</th>
                <th>Fecha Registro</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => {
                const isSelf = user?.id === profile.id;
                return (
                  <tr key={profile.id}>
                    <td>
                      <strong>{profile.email ?? "Sin correo"}</strong> {isSelf && <span className="status approved" style={{ minHeight: "20px", minWidth: "50px", fontSize: "0.7rem", padding: "0 6px", marginLeft: "6px" }}>Tú</span>}
                    </td>
                    <td>
                      <span className={`status ${profile.role === "admin" ? "approved" : profile.role === "producer" ? "skipped" : "pending"}`}>
                        {profile.role}
                      </span>
                    </td>
                    <td>{formatDate(profile.createdAt)}</td>
                    <td>
                      {isSelf ? (
                        <span className="muted">No modificable</span>
                      ) : (
                        <form action={updateUserRoleAction} className="actions" style={{ alignItems: "center", display: "flex", gap: "8px" }}>
                          <input type="hidden" name="userId" value={profile.id} />
                          <select name="role" defaultValue={profile.role} style={{ minHeight: "34px", padding: "4px 8px" }}>
                            <option value="viewer">viewer</option>
                            <option value="producer">producer</option>
                            <option value="admin">admin</option>
                          </select>
                          <button type="submit" style={{ minHeight: "34px", padding: "0 12px" }}>Actualizar</button>
                        </form>
                      )}
                    </td>
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
