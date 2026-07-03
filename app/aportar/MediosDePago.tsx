"use client";

import { useState } from "react";
import { TITULAR_PAGO, MEDIOS_PAGO } from "@/lib/constants";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="flex-none rounded-lg px-2 py-1 text-xs font-semibold text-[var(--brand-soft-fg)] hover:bg-[var(--brand-soft)]"
      aria-label={`Copiar ${text}`}
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}

export function MediosDePago() {
  return (
    <div className="themed mb-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">💸</span>
        <h2 className="font-bold">¿A dónde consignar?</h2>
      </div>
      <p className="mb-3 text-xs text-[var(--muted)]">
        Titular: <span className="font-medium text-[var(--foreground)]">{TITULAR_PAGO}</span>
      </p>
      <ul className="divide-y divide-[var(--border)]">
        {MEDIOS_PAGO.map((m) => (
          <li key={m.label} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--muted)]">{m.label}</p>
              <p className="font-semibold tabular-nums">{m.valor}</p>
              {m.nota && <p className="text-xs text-[var(--muted)]">{m.nota}</p>}
            </div>
            <CopyButton text={m.valor} />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Después de consignar, registra tu aporte abajo y adjunta el comprobante. 🐷
      </p>
    </div>
  );
}
