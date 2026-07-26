"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActionState } from "react";

type ToastKind = "ok" | "error";
type ToastItem = { id: number; msg: string; kind: ToastKind };
type ShowFn = (msg: string, kind?: ToastKind) => void;

const ToastCtx = createContext<ShowFn | null>(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let seq = 0;

  const show: ShowFn = useCallback((msg, kind = "ok") => {
    const id = Date.now() + seq++;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 print:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
            style={{
              background: "var(--surface)",
              borderColor: t.kind === "ok" ? "var(--ok)" : "var(--danger)",
              color: t.kind === "ok" ? "var(--ok)" : "var(--danger)",
            }}
          >
            <span>{t.kind === "ok" ? "✅" : "⚠️"}</span>
            <span className="text-[var(--foreground)]">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

type Result = { ok: boolean; message?: string; error?: string } | null;

/**
 * Formulario que ejecuta una Server Action y muestra un toast con el
 * resultado. La acción debe devolver { ok, message } o { ok:false, error }.
 */
export function ToastForm({
  action,
  children,
  className,
  confirm,
}: {
  action: (prev: unknown, formData: FormData) => Promise<Result>;
  children: React.ReactNode;
  className?: string;
  confirm?: string;
}) {
  const toast = useToast();
  const [state, formAction] = useActionState<Result, FormData>(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast?.(state.message ?? "Listo", "ok");
    else if (state.error) toast?.(state.error, "error");
  }, [state, toast]);

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
