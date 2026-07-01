import { formatCOP } from "@/lib/money";
import { IconAvatar } from "./decor";
import type { Contribution, ContributionStatus } from "@/lib/types";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`themed rounded-3xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--muted)]">
      {children}
    </h2>
  );
}

export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`themed rounded-2xl border p-4 shadow-[var(--shadow)] ${
        accent
          ? "border-transparent bg-[var(--brand)] text-white"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <p className="text-xl font-extrabold tabular-nums tracking-tight sm:text-2xl">
        {value}
      </p>
      <p
        className={`mt-0.5 text-xs ${accent ? "text-white/80" : "text-[var(--muted)]"}`}
      >
        {label}
      </p>
    </div>
  );
}

const STATUS: Record<ContributionStatus, { label: string; bg: string; fg: string }> = {
  confirmado: { label: "Confirmado", bg: "var(--ok-soft)", fg: "var(--ok)" },
  pendiente: { label: "Pendiente", bg: "var(--warn-soft)", fg: "var(--warn)" },
  reversado: { label: "Reversado", bg: "var(--border)", fg: "var(--muted)" },
};

export function StatusBadge({ status }: { status: ContributionStatus }) {
  const s = STATUS[status];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

export function MovementRow({
  c,
  showStatus = false,
}: {
  c: Contribution;
  showStatus?: boolean;
}) {
  const reversed = c.status === "reversado";
  return (
    <div className="themed flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <IconAvatar name={c.memberName} />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${reversed ? "line-through opacity-60" : ""}`}>
          {c.memberName}
        </p>
        <p className="text-xs text-[var(--muted)]">
          {formatDate(c.date)}
          {c.note ? ` · ${c.note}` : ""}
        </p>
      </div>
      {showStatus && <StatusBadge status={c.status} />}
      <span
        className={`font-bold tabular-nums ${
          c.status === "confirmado" ? "text-[var(--ok)]" : "text-[var(--muted)]"
        }`}
      >
        {c.status === "confirmado" ? "+ " : ""}
        {formatCOP(c.amount)}
      </span>
    </div>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
