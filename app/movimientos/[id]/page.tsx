import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { formatCOP } from "@/lib/money";
import { metodoLabel } from "@/lib/constants";
import { AppShell } from "@/components/AppShell";
import { Card, StatusBadge, formatDate } from "@/components/ui";
import { EmojiAvatar } from "@/components/decor";

export const dynamic = "force-dynamic";

export default async function MovimientoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getStore().getContribution(id);
  if (!c) notFound();

  const registrado = new Date(c.createdAt).toLocaleString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <Link href="/movimientos" className="text-sm font-semibold text-[var(--muted)]">
          ← Movimientos
        </Link>

        {/* Encabezado: monto + estado */}
        <Card className="mt-4 p-6 text-center">
          <div className="mx-auto mb-3">
            <EmojiAvatar emoji={c.memberEmoji} color={c.memberColor} size="lg" />
          </div>
          <p
            className={`text-4xl font-extrabold tabular-nums ${
              c.status === "confirmado" ? "text-[var(--ok)]" : ""
            } ${c.status === "reversado" ? "line-through opacity-60" : ""}`}
          >
            {c.status === "confirmado" ? "+ " : ""}
            {formatCOP(c.amount)}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Link href={`/companeros/${c.memberId}`} className="font-semibold hover:underline">
              {c.memberName}
            </Link>
            <StatusBadge status={c.status} />
          </div>
        </Card>

        {/* Detalle */}
        <Card className="mt-4 divide-y divide-[var(--border)]">
          <Row label="Fecha del aporte" value={formatDate(c.date)} />
          {c.metodo && <Row label="Método de pago" value={metodoLabel(c.metodo)} />}
          {c.descripcion && <Row label="Descripción" value={c.descripcion} />}
          {c.note && <Row label="Motivo de reversa" value={c.note} />}
          <Row label="Registrado" value={registrado} />
        </Card>

        {/* Soporte */}
        <h2 className="mt-6 mb-3 text-xs font-bold tracking-wider text-[var(--muted)]">
          COMPROBANTE
        </h2>
        {c.soporteUrl ? (
          <a href={c.soporteUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Card className="overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.soporteUrl}
                alt="Comprobante del aporte"
                className="max-h-[70vh] w-full object-contain"
              />
              <p className="px-4 py-2 text-center text-xs text-[var(--muted)]">
                Toca para ver en tamaño completo
              </p>
            </Card>
          </a>
        ) : (
          <Card className="px-5 py-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              Este movimiento no tiene comprobante adjunto.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}
