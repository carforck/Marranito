"use client";

import { useActionState } from "react";
import { registrarAporte } from "./actions";
import { METODOS } from "@/lib/constants";
import type { Member } from "@/lib/types";

export function AportarForm({ members }: { members: Member[] }) {
  const [state, action, pending] = useActionState(registrarAporte, {
    ok: false,
    error: null,
  } as { ok: boolean; error: string | null });

  if (state?.ok) {
    return (
      <div className="themed rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ok-soft)] text-2xl">
          ✅
        </div>
        <h2 className="text-lg font-bold">¡Aporte registrado!</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Queda como <b>pendiente</b> hasta que el tesorero lo confirme. Gracias 🐷
        </p>
        <a
          href="/aportar"
          className="mt-5 inline-block rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Registrar otro
        </a>
      </div>
    );
  }

  const input =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none focus:border-[var(--brand)]";

  return (
    <form
      action={action}
      className="themed space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <Field label="¿Quién aporta?">
        <select name="memberId" required defaultValue="" className={input}>
          <option value="" disabled>
            Elige tu nombre…
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.emoji} {m.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Monto (COP)">
          <input name="amount" inputMode="numeric" placeholder="200.000" required className={input} />
        </Field>
        <Field label="Fecha">
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={input}
          />
        </Field>
      </div>

      <Field label="¿Cómo pagaste?">
        <select name="metodo" defaultValue="" className={input}>
          <option value="">Sin especificar</option>
          {METODOS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Descripción (opcional)">
        <input
          name="descripcion"
          placeholder="Ej: transferencia desde mi cuenta de ahorros"
          className={input}
        />
      </Field>

      <Field label="Soporte / comprobante (opcional)">
        <input
          name="soporte"
          type="file"
          accept="image/*"
          className="w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--brand-soft)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--brand-soft-fg)]"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          Sube la captura de la transferencia. La verá el grupo para dar transparencia.
        </p>
      </Field>

      {state?.error && (
        <p className="text-sm font-medium text-[var(--danger)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--brand)] py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar aporte"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
