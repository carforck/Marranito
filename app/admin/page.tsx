import Link from "next/link";
import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { isAuthed } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { Card, StatusBadge } from "@/components/ui";
import { EmojiAvatar } from "@/components/decor";
import { metodoLabel } from "@/lib/constants";
import { LoginForm } from "./LoginForm";
import { MembersManager } from "./MembersManager";
import {
  logout,
  setQuota,
  addContribution,
  confirmContribution,
  reverseContribution,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthed())) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-sm px-5 py-16">
          <Card className="p-6">
            <h1 className="mb-1 text-xl font-bold">Tesorería</h1>
            <p className="mb-6 text-sm text-[var(--muted)]">
              Zona para registrar y validar aportes.
            </p>
            <LoginForm />
          </Card>
        </main>
      </AppShell>
    );
  }

  const store = getStore();
  const [members, all, quota] = await Promise.all([
    store.listMembers(),
    store.listAll(),
    store.getMonthlyQuota(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl space-y-8 px-5 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Tesorería</h1>
          <form action={logout}>
            <button className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
              Salir
            </button>
          </form>
        </div>

        {/* Cuota del ciclo */}
        <Card className="p-5">
          <h2 className="mb-1 font-semibold">Cuota mensual</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Cuánto debería aportar cada compañero por mes. Con esto la app marca
            quién va al día. Déjalo en 0 si no quieres metas.
          </p>
          <form action={setQuota} className="flex gap-2">
            <input
              name="quota"
              inputMode="numeric"
              defaultValue={quota || ""}
              placeholder="Ej: 200000"
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
            <button className="rounded-xl bg-[var(--brand)] px-5 font-semibold text-white">
              Guardar
            </button>
          </form>
        </Card>

        {/* Registrar aporte */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Registrar aporte</h2>
          <form action={addContribution} className="grid gap-3 sm:grid-cols-2">
            <select
              name="memberId"
              required
              className="rounded-xl border border-[var(--border)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            >
              <option value="">Compañero…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.name}
                </option>
              ))}
            </select>
            <input
              name="amount"
              placeholder="Monto (ej. 200000)"
              inputMode="numeric"
              required
              className="rounded-xl border border-[var(--border)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
            <input
              name="date"
              type="date"
              defaultValue={today}
              required
              className="rounded-xl border border-[var(--border)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
            <label className="flex items-center gap-2 px-1 text-sm">
              <input type="checkbox" name="confirmNow" defaultChecked />
              Confirmar de una vez
            </label>
            <button className="rounded-xl bg-[var(--brand)] py-2.5 font-semibold text-white sm:col-span-2">
              Registrar
            </button>
          </form>
        </Card>

        {/* Movimientos */}
        <Card className="divide-y divide-[var(--border)]">
          <h2 className="px-5 py-3 font-semibold">Movimientos ({all.length})</h2>
          {all.map((c) => (
            <div key={c.id} className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <EmojiAvatar emoji={c.memberEmoji} color={c.memberColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link href={`/movimientos/${c.id}`} className="truncate font-medium hover:underline">
                    {c.memberName}
                  </Link>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {c.date}
                    {c.metodo ? ` · ${metodoLabel(c.metodo)}` : ""}
                    {c.descripcion ? ` · ${c.descripcion}` : ""}
                    {c.note ? ` · motivo: ${c.note}` : ""}
                  </p>
                </div>
                {c.soporteUrl && (
                  <a
                    href={c.soporteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[var(--brand-soft-fg)]"
                  >
                    soporte
                  </a>
                )}
                <StatusBadge status={c.status} />
                <span className="font-semibold tabular-nums">{formatCOP(c.amount)}</span>
              </div>
              {c.status !== "reversado" && (
                <div className="mt-2 flex flex-wrap items-center gap-2 pl-12">
                  {c.status === "pendiente" && (
                    <form action={confirmContribution}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        className="rounded-lg px-3 py-1 text-xs font-semibold"
                        style={{ background: "var(--ok-soft)", color: "var(--ok)" }}
                      >
                        Confirmar
                      </button>
                    </form>
                  )}
                  <form action={reverseContribution} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={c.id} />
                    <input
                      name="note"
                      placeholder="Motivo de reversa"
                      required
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs outline-none focus:border-[var(--brand)]"
                    />
                    <button className="rounded-lg bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      Reversar
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </Card>

        {/* Compañeros — CRUD */}
        <Card className="p-5">
          <MembersManager members={members} />
        </Card>
      </main>
    </AppShell>
  );
}
