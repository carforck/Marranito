import { getStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { MovementRow, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function MovimientosPage() {
  const store = getStore();
  // Transparencia: todos ven todos los movimientos (confirmados y pendientes).
  const all = await store.listAll();
  const visibles = all.filter((c) => c.status !== "reversado" || c.note);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Movimientos</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Todo lo que entra al fondo, a la vista de todos.
        </p>

        {visibles.length === 0 ? (
          <Card className="mt-6 px-5 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">Aún no hay movimientos.</p>
          </Card>
        ) : (
          <div className="mt-6 space-y-2.5">
            {visibles.map((c) => (
              <MovementRow key={c.id} c={c} showStatus />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
