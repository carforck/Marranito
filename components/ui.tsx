import Link from "next/link";
import { Logo } from "./Logo";
import type { ContributionStatus } from "@/lib/types";

export function Header({ adminLink = true }: { adminLink?: boolean }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link href="/">
          <Logo size={34} />
        </Link>
        {adminLink && (
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Tesorería
          </Link>
        )}
      </div>
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: ContributionStatus }) {
  const map: Record<ContributionStatus, { label: string; cls: string }> = {
    confirmado: { label: "Confirmado", cls: "bg-green-50 text-green-700" },
    pendiente: { label: "Pendiente", cls: "bg-amber-50 text-amber-700" },
    reversado: { label: "Reversado", cls: "bg-gray-100 text-gray-500 line-through" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
