import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroPrecio Monitor",
  description: "Comparador de precios entre supermercados y productores."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="shell">
          <aside className="sidebar" aria-label="Navegacion principal">
            <Link className="brand" href="/">
              <div className="brand-mark" aria-hidden="true">AP</div>
              <div>
                <strong>AgroPrecio</strong>
                <span>Monitor</span>
              </div>
            </Link>
            <nav className="nav" aria-label="Secciones">
              <Link className="active" href="/">Dashboard</Link>
              <Link href="/comparador">Comparador</Link>
              <Link href="/producer">Panel productor</Link>
              <Link href="/admin">Admin</Link>
              <Link href="/login">Login</Link>
            </nav>
            <p className="sidebar-note">
              MVP para Vercel con Supabase, roles y captura programada de precios.
            </p>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
