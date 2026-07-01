import Link from "next/link";
import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { seriesByMember } from "@/lib/analytics";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, StatCard, MovementRow } from "@/components/ui";
import { HeroDecor, EmojiAvatar } from "@/components/decor";
import { MultiLineChart } from "@/components/MultiLineChart";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = getStore();
  const [summary, confirmed, members] = await Promise.all([
    store.getSummary(),
    store.listConfirmed(),
    store.listMembers(),
  ]);

  const now = new Date();
  const upTo = now.getFullYear() === summary.cycleYear ? now.getMonth() + 1 : 12;
  const { labels, series } = seriesByMember(confirmed, members, summary.cycleYear, upTo);
  const recent = confirmed.slice(0, 6);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        {/* Hero */}
        <section className="hero-gradient relative overflow-hidden rounded-3xl px-6 py-7 text-white">
          <HeroDecor />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">
                Ahorrado en {summary.cycleYear}
              </p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {formatCOP(summary.totalConfirmed)}
              </p>
              <p className="mt-2 text-sm text-white/75">
                Fondo transparente · {summary.memberCount} compañeros
              </p>
            </div>
            <Link
              href="/aportar"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[var(--brand)] shadow-lg"
            >
              + Registrar aporte
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Ahorrado" value={formatCOP(summary.totalConfirmed)} accent />
          <StatCard label="Compañeros" value={String(summary.memberCount)} />
          <StatCard label="Aportes" value={String(summary.contributionCount)} />
          <StatCard label="Por confirmar" value={formatCOP(summary.totalPending)} />
        </section>

        {/* Gráfica multi-línea + top compañeros */}
        <section className="mt-6 grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <MultiLineChart labels={labels} series={series} total={summary.totalConfirmed} />
          </div>
          <div className="lg:col-span-2">
            <Card className="h-full p-5">
              <SectionTitle>QUIÉN MÁS HA APORTADO</SectionTitle>
              {series.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Aún no hay aportes.</p>
              ) : (
                <ul className="space-y-3">
                  {series.slice(0, 5).map((m, i) => (
                    <li key={m.memberId}>
                      <Link href={`/companeros/${m.memberId}`} className="flex items-center gap-3">
                        <span className="w-4 text-sm font-bold text-[var(--muted)]">{i + 1}</span>
                        <EmojiAvatar emoji={m.emoji} color={m.color} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{m.name}</p>
                        </div>
                        <span className="text-sm font-bold tabular-nums">{formatCOP(m.total)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </section>

        {/* Movimientos recientes */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>MOVIMIENTOS RECIENTES</SectionTitle>
            <Link href="/movimientos" className="text-xs font-semibold text-[var(--brand-soft-fg)]">
              Ver todos →
            </Link>
          </div>
          {recent.length === 0 ? (
            <Card className="px-5 py-10 text-center">
              <p className="text-sm text-[var(--muted)]">Todavía no hay aportes confirmados.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {recent.map((c) => (
                <MovementRow key={c.id} c={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
