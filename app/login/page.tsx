export default function LoginPage() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Acceso</p>
          <h1>Login preparado para Supabase Auth</h1>
        </div>
      </header>

      <section className="form-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Configuracion necesaria</p>
            <h2>Activa Supabase para autenticar usuarios</h2>
          </div>
        </div>
        <p className="muted">
          Configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
          Despues puedes sustituir esta pantalla por magic link, email/password o OAuth.
        </p>
      </section>
    </>
  );
}
