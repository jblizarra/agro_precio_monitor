import { signInAction, signUpAction, signOutAction } from "@/app/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/data";

type Props = {
  searchParams: { error?: string; success?: string };
};

export default async function LoginPage({ searchParams }: Props) {
  const supabase = createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const role = user ? await getCurrentUserRole() : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 16px;
        }
        .auth-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .alert-banner {
          padding: 12px 16px;
          border-radius: 7px;
          font-weight: 600;
          margin-bottom: 16px;
          width: 100%;
        }
        .alert-banner.error {
          background: #fde4df;
          color: #9b2c20;
          border: 1px solid #f9c2b9;
        }
        .alert-banner.success {
          background: #e3f3e5;
          color: #17633f;
          border: 1px solid #c3e6c7;
        }
      `}} />

      <header className="topbar">
        <div>
          <p className="eyebrow">Acceso</p>
          <h1>Gestión de Cuenta</h1>
        </div>
      </header>

      {searchParams.error && (
        <div className="alert-banner error">{decodeURIComponent(searchParams.error)}</div>
      )}
      {searchParams.success && (
        <div className="alert-banner success">{decodeURIComponent(searchParams.success)}</div>
      )}

      {user ? (
        <section className="form-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Sesión Activa</p>
              <h2>Conectado como {user.email}</h2>
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "4px 0" }}>ID de Usuario: <code style={{ background: "var(--field)", padding: "2px 6px", borderRadius: "4px" }}>{user.id}</code></p>
            <p style={{ margin: "4px 0" }}>Rol Asignado: <span className={`status ${role === "admin" ? "approved" : role === "producer" ? "skipped" : "pending"}`} style={{ minWidth: "120px", marginLeft: "8px" }}>{role}</span></p>
          </div>
          <form action={signOutAction}>
            <button className="danger" type="submit">Cerrar Sesión</button>
          </form>
        </section>
      ) : (
        <div className="auth-container">
          <section className="form-panel auth-box">
            <div className="section-head">
              <div>
                <p className="eyebrow">Ingreso</p>
                <h2>Iniciar Sesión</h2>
              </div>
            </div>
            <form className="form-grid" action={signInAction}>
              <label className="full">
                Email
                <input name="email" type="email" placeholder="correo@ejemplo.com" required />
              </label>
              <label className="full">
                Contraseña
                <input name="password" type="password" placeholder="••••••••" required />
              </label>
              <div className="actions full" style={{ marginTop: "12px" }}>
                <button type="submit" style={{ width: "100%" }}>Ingresar</button>
              </div>
            </form>
          </section>

          <section className="form-panel auth-box">
            <div className="section-head">
              <div>
                <p className="eyebrow">Nuevo Registro</p>
                <h2>Crear Cuenta</h2>
              </div>
            </div>
            <form className="form-grid" action={signUpAction}>
              <label className="full">
                Email
                <input name="email" type="email" placeholder="correo@ejemplo.com" required />
              </label>
              <label className="full">
                Contraseña
                <input name="password" type="password" placeholder="Mínimo 6 caracteres" minLength={6} required />
              </label>
              <div className="actions full" style={{ marginTop: "12px" }}>
                <button type="submit" className="secondary" style={{ width: "100%" }}>Registrarse</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
