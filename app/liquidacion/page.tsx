import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { memberTotals, monthsElapsed, quotaStatus } from "@/lib/analytics";
import { CYCLE_YEAR } from "@/lib/constants";
import { AppShell } from "@/components/AppShell";
import { EmojiAvatar } from "@/components/decor";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function LiquidacionPage() {
  const store = getStore();
  const [summary, confirmed, members, quota] = await Promise.all([
    store.getSummary(),
    store.listConfirmed(),
    store.listMembers(),
    store.getMonthlyQuota(),
  ]);

  const meses = monthsElapsed(CYCLE_YEAR, new Date());
  const totalById = new Map(memberTotals(confirmed).map((t) => [t.memberId, t]));
  const grand = summary.totalConfirmed;

  const rows = members
    .map((m) => {
      const t = totalById.get(m.id);
      const total = t?.total ?? 0;
      const qs = quotaStatus(total, quota, meses);
      return {
        ...m,
        total,
        count: t?.count ?? 0,
        pct: grand > 0 ? Math.round((total / grand) * 100) : 0,
        qs,
      };
    })
    .sort((a, b) => b.total - a.total);

  const generado = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8 print:px-0 print:py-0">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Liquidación del fondo</h1>
            <p className="text-sm text-[var(--muted)]">
              Ciclo {summary.cycleYear} · generado el {generado}
            </p>
          </div>
          <PrintButton />
        </div>

        {/* Totales del fondo */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <Box label="Total ahorrado" value={formatCOP(summary.totalConfirmed)} />
          <Box label="Compañeros" value={String(summary.memberCount)} />
          <Box label="Aportes" value={String(summary.contributionCount)} />
        </div>

        {/* Tabla por compañero */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                <th className="px-4 py-3 font-semibold">Compañero</th>
                <th className="px-4 py-3 text-right font-semibold">Aportado</th>
                <th className="px-4 py-3 text-right font-semibold">Aportes</th>
                <th className="px-4 py-3 text-right font-semibold">% fondo</th>
                {quota > 0 && <th className="px-4 py-3 text-right font-semibold">Estado</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <EmojiAvatar emoji={m.emoji} color={m.color} size="sm" />
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{formatCOP(m.total)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{m.count}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{m.pct}%</td>
                  {quota > 0 && (
                    <td className="px-4 py-3 text-right">
                      {m.qs ? (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: m.qs.alDia ? "var(--ok)" : "var(--warn)" }}
                        >
                          {m.qs.alDia ? "Al día" : `Debe ${formatCOP(m.qs.falta)}`}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--border)] font-bold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCOP(grand)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{summary.contributionCount}</td>
                <td className="px-4 py-3 text-right">100%</td>
                {quota > 0 && <td className="px-4 py-3" />}
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="mt-4 text-xs text-[var(--muted)]">
          Reporte generado por Marranito 🐷 · Fondo transparente · Solo aportes confirmados.
          {quota > 0 && ` Cuota mensual de referencia: ${formatCOP(quota)}.`}
        </p>
      </div>
    </AppShell>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-lg font-extrabold tabular-nums">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
