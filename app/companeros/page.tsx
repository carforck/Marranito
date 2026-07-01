import Link from "next/link";
import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { memberTotals } from "@/lib/analytics";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui";
import { EmojiAvatar } from "@/components/decor";

export const dynamic = "force-dynamic";

export default async function CompanerosPage() {
  const store = getStore();
  const [members, confirmed] = await Promise.all([
    store.listMembers(),
    store.listConfirmed(),
  ]);

  const totals = memberTotals(confirmed);
  const totalById = new Map(totals.map((t) => [t.memberId, t]));
  const grand = totals.reduce((s, t) => s + t.total, 0);

  const rows = members
    .map((m) => ({
      ...m,
      total: totalById.get(m.id)?.total ?? 0,
      count: totalById.get(m.id)?.count ?? 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Compañeros</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cuánto ha aportado cada quien. Toca a alguien para ver su historial.
        </p>

        {rows.length === 0 ? (
          <Card className="mt-6 px-5 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">
              Aún no hay compañeros. El tesorero los crea en la Tesorería.
            </p>
          </Card>
        ) : (
          <div className="mt-6 space-y-2.5">
            {rows.map((m, i) => {
              const pct = grand > 0 ? Math.round((m.total / grand) * 100) : 0;
              return (
                <Link key={m.id} href={`/companeros/${m.id}`} className="block">
                  <Card className="flex items-center gap-3 px-4 py-3 transition hover:border-[var(--brand)]">
                    <span className="w-5 text-center text-sm font-bold text-[var(--muted)]">
                      {i + 1}
                    </span>
                    <EmojiAvatar emoji={m.emoji} color={m.color} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{m.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {m.count} {m.count === 1 ? "aporte" : "aportes"} · {pct}% del fondo
                      </p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: m.color }}
                        />
                      </div>
                    </div>
                    <span className="font-bold tabular-nums">{formatCOP(m.total)}</span>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
