import Link from "next/link";
import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { StatusBadge } from "@/components/ui";
import { MarranitoMark } from "@/components/Logo";
import { HeroDecor, IconAvatar } from "@/components/decor";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = getStore();
  const [summary, confirmed] = await Promise.all([
    store.getSummary(),
    store.listConfirmed(),
  ]);

  return (
    <main className="mx-auto w-full max-w-md flex-1 pb-24">
      {/* HERO con degradado morado */}
      <section className="hero-gradient relative overflow-hidden px-6 pb-24 pt-8 text-white">
        <HeroDecor />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MarranitoMark size={32} />
            <span className="text-lg font-extrabold tracking-tight">Marranito</span>
          </div>
          <Link
            href="/admin"
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"
          >
            Tesorería
          </Link>
        </div>

        <div className="relative mt-8">
          <p className="text-sm font-medium text-white/80">
            Ahorrado en {summary.cycleYear}
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">
            {formatCOP(summary.totalConfirmed)}
          </p>
        </div>
      </section>

      {/* Tarjeta de stats, flotando sobre el hero */}
      <section className="-mt-16 px-4">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Compañeros" value={String(summary.memberCount)} />
          <MiniStat label="Aportes" value={String(summary.contributionCount)} />
          <MiniStat
            label="Por confirmar"
            value={formatCOP(summary.totalPending)}
            small
          />
        </div>
      </section>

      {/* Movimientos */}
      <section className="mt-8 px-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide text-[var(--muted)]">
            MOVIMIENTOS
          </h2>
        </div>

        {confirmed.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">
              Todavía no hay aportes confirmados.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {confirmed.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <IconAvatar name={c.memberName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.memberName}</p>
                  <p className="text-xs text-[var(--muted)]">{formatDate(c.date)}</p>
                </div>
                <span className="font-bold tabular-nums text-[var(--ok)]">
                  + {formatCOP(c.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--muted)]">
          <StatusBadge status="confirmado" />
          Por privacidad, los comprobantes no se muestran aquí.
        </p>
      </section>
    </main>
  );
}

function MiniStat({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[var(--surface)] px-3 py-4 text-center shadow-[0_8px_30px_rgba(70,60,150,0.10)]">
      <p
        className={`font-extrabold tabular-nums ${small ? "text-sm" : "text-lg"}`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] leading-tight text-[var(--muted)]">
        {label}
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
