import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { Header, Card, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = getStore();
  const [summary, confirmed] = await Promise.all([
    store.getSummary(),
    store.listConfirmed(),
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        {/* Total del fondo */}
        <Card className="overflow-hidden">
          <div className="bg-[var(--brand)] px-6 py-8 text-white">
            <p className="text-sm font-medium opacity-90">
              Ahorrado en {summary.cycleYear}
            </p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {formatCOP(summary.totalConfirmed)}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
            <Stat label="Compañeros" value={String(summary.memberCount)} />
            <Stat label="Aportes" value={String(summary.contributionCount)} />
            <Stat
              label="Por confirmar"
              value={formatCOP(summary.totalPending)}
            />
          </div>
        </Card>

        {/* Movimientos confirmados (sin datos sensibles) */}
        <h2 className="mt-8 mb-3 px-1 text-sm font-semibold text-[var(--muted)]">
          MOVIMIENTOS CONFIRMADOS
        </h2>
        <Card className="divide-y divide-[var(--border)]">
          {confirmed.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">
              Todavía no hay aportes confirmados.
            </p>
          )}
          {confirmed.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="font-medium">{c.memberName}</p>
                <p className="text-xs text-[var(--muted)]">{formatDate(c.date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={c.status} />
                <span className="font-semibold tabular-nums">
                  {formatCOP(c.amount)}
                </span>
              </div>
            </div>
          ))}
        </Card>

        <p className="mt-6 px-1 text-center text-xs text-[var(--muted)]">
          Por privacidad, los comprobantes bancarios no se muestran aquí. Solo el
          tesorero los revisa.
        </p>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-4 text-center">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
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
