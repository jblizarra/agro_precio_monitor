import type { Metadata } from "next";
import Link from "next/link";
import { SidebarNav } from "@/components/SidebarNav";
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
            <SidebarNav />
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

