import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { isAuthed } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { Card, StatusBadge } from "@/components/ui";
import { LoginForm } from "./LoginForm";
import {
  logout,
  addMember,
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
  const [members, all] = await Promise.all([
    store.listMembers(),
    store.listAll(),
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
                  {m.name}
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
          <h2 className="px-5 py-3 font-semibold">Movimientos</h2>
          {all.map((c) => (
            <div key={c.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.memberName}</p>
                  <p className="text-xs text-[var(--muted)]">{c.date}</p>
                  {c.note && (
                    <p className="text-xs text-[var(--muted)]">Motivo: {c.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  <span className="font-semibold tabular-nums">
                    {formatCOP(c.amount)}
                  </span>
                </div>
              </div>
              {c.status !== "reversado" && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {c.status === "pendiente" && (
                    <form action={confirmContribution}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
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
                      className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs outline-none focus:border-[var(--brand)]"
                    />
                    <button className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      Reversar
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </Card>

        {/* Compañeros */}
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Compañeros ({members.length})</h2>
          <form action={addMember} className="flex gap-2">
            <input
              name="name"
              placeholder="Nombre del compañero"
              required
              className="flex-1 rounded-xl border border-[var(--border)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
            <button className="rounded-xl border border-[var(--brand)] px-4 font-semibold text-[var(--brand)]">
              Agregar
            </button>
          </form>
          <ul className="mt-3 flex flex-wrap gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm text-[var(--foreground)]"
              >
                {m.name}
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </AppShell>
  );
}
