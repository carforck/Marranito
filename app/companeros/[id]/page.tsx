import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { monthlySeries, monthsElapsed, quotaStatus } from "@/lib/analytics";
import { CYCLE_YEAR } from "@/lib/constants";
import { AppShell } from "@/components/AppShell";
import { Card, MovementRow, QuotaChip } from "@/components/ui";
import { EmojiAvatar } from "@/components/decor";
import { SavingsChart } from "@/components/SavingsChart";

export const dynamic = "force-dynamic";

export default async function PerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = getStore();
  const member = await store.getMember(id);
  if (!member) notFound();

  const [movs, quota] = await Promise.all([
    store.listByMember(id),
    store.getMonthlyQuota(),
  ]);
  const confirmados = movs.filter((c) => c.status === "confirmado");
  const total = confirmados.reduce((s, c) => s + c.amount, 0);
  const pendiente = movs
    .filter((c) => c.status === "pendiente")
    .reduce((s, c) => s + c.amount, 0);

  const now = new Date();
  const upTo = now.getFullYear() === CYCLE_YEAR ? now.getMonth() + 1 : 12;
  const series = monthlySeries(confirmados, CYCLE_YEAR, upTo);
  const qs = quotaStatus(total, quota, monthsElapsed(CYCLE_YEAR, now));

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        <Link href="/companeros" className="text-sm font-semibold text-[var(--muted)]">
          ← Compañeros
        </Link>

        {/* Cabecera del perfil */}
        <div className="mt-4 flex items-center gap-4">
          <EmojiAvatar emoji={member.emoji} color={member.color} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{member.name}</h1>
              {qs && <QuotaChip falta={qs.falta} alDia={qs.alDia} />}
            </div>
            <p className="text-sm text-[var(--muted)]">
              {confirmados.length} {confirmados.length === 1 ? "aporte" : "aportes"} confirmados
            </p>
          </div>
        </div>

        {/* Totales */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 text-white shadow-[var(--shadow)]"
            style={{ background: member.color }}
          >
            <p className="text-2xl font-extrabold tabular-nums">{formatCOP(total)}</p>
            <p className="text-xs text-white/85">Ahorrado</p>
          </div>
          <Card className="p-4">
            <p className="text-2xl font-extrabold tabular-nums">{formatCOP(pendiente)}</p>
            <p className="text-xs text-[var(--muted)]">Por confirmar</p>
          </Card>
        </div>

        {/* Gráfica en su color */}
        <div className="mt-4">
          <SavingsChart data={series} color={member.color} title={`AHORRO DE ${member.name.toUpperCase()}`} />
        </div>

        {/* Sus movimientos */}
        <h2 className="mt-6 mb-3 text-xs font-bold tracking-wider text-[var(--muted)]">
          SUS MOVIMIENTOS
        </h2>
        {movs.length === 0 ? (
          <Card className="px-5 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">Aún no ha registrado aportes.</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {movs.map((c) => (
              <MovementRow key={c.id} c={c} showStatus />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
