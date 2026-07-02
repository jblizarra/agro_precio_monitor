'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/comparador", label: "Comparador" },
    { href: "/producer", label: "Panel productor" },
    { href: "/admin", label: "Admin" },
    { href: "/login", label: "Login" },
  ];

  return (
    <nav className="nav" aria-label="Secciones">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            className={isActive ? "active" : ""}
            href={link.href as any}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
