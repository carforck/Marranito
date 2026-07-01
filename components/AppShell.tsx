"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarranitoMark } from "./Logo";

type IconName = "home" | "plus" | "list" | "people" | "vault";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Resumen", icon: "home" },
  { href: "/aportar", label: "Aportar", icon: "plus" },
  { href: "/movimientos", label: "Movimientos", icon: "list" },
  { href: "/companeros", label: "Compañeros", icon: "people" },
  { href: "/admin", label: "Tesorería", icon: "vault" },
];

function Icon({ name }: { name: IconName }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home":
      return <svg viewBox="0 0 24 24" className="h-5 w-5" {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>;
    case "plus":
      return <svg viewBox="0 0 24 24" className="h-5 w-5" {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>;
    case "list":
      return <svg viewBox="0 0 24 24" className="h-5 w-5" {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>;
    case "people":
      return <svg viewBox="0 0 24 24" className="h-5 w-5" {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.5M17 20a6 6 0 0 0-3-5" /></svg>;
    case "vault":
      return <svg viewBox="0 0 24 24" className="h-5 w-5" {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="12" cy="12" r="3.2" /><path d="M12 4v2M12 18v2" /></svg>;
  }
}

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };
  return { dark, toggle };
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-[var(--brand-soft)] text-[var(--brand-soft-fg)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            }`}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
      aria-label="Cambiar tema"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      )}
      {dark ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Sidebar escritorio */}
      <aside className="themed fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2 pt-2">
          <MarranitoMark size={34} />
          <span className="text-xl font-extrabold tracking-tight">Marranito</span>
        </Link>
        <NavLinks />
        <div className="mt-auto border-t border-[var(--border)] pt-2">
          <ThemeToggle />
          <p className="px-3 pt-3 text-[11px] leading-tight text-[var(--muted)]">
            App de transparencia del fondo. Todos ven lo mismo.
          </p>
        </div>
      </aside>

      {/* Topbar móvil */}
      <header className="themed sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <MarranitoMark size={28} />
          <span className="text-lg font-extrabold tracking-tight">Marranito</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="rounded-lg p-1.5 text-[var(--muted)]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>

      {/* Drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="themed absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--surface)] p-4">
            <div className="mb-6 flex items-center justify-between px-2 pt-1">
              <span className="flex items-center gap-2 text-lg font-extrabold">
                <MarranitoMark size={28} /> Marranito
              </span>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1 text-[var(--muted)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto border-t border-[var(--border)] pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
