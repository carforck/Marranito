"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, { error: null });
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">PIN de tesorería</label>
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          autoFocus
          placeholder="••••"
          className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-[var(--brand)]"
        />
      </div>
      {state?.error && (
        <p className="text-sm font-medium text-[var(--brand)]">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--brand)] py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}
