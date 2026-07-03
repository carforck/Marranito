import { getStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui";
import { AportarForm } from "./AportarForm";
import { MediosDePago } from "./MediosDePago";

export const dynamic = "force-dynamic";

export default async function AportarPage() {
  const members = await getStore().listMembers();

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Registrar aporte</h1>
        <p className="mt-1 mb-6 text-sm text-[var(--muted)]">
          Cada quien registra el suyo. Queda pendiente hasta que el tesorero lo confirme.
        </p>

        <MediosDePago />

        {members.length === 0 ? (
          <Card className="px-5 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">
              Aún no hay compañeros. El tesorero debe crearlos primero.
            </p>
          </Card>
        ) : (
          <AportarForm members={members} />
        )}
      </div>
    </AppShell>
  );
}
