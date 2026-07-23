"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white print:hidden"
    >
      Descargar / Imprimir PDF
    </button>
  );
}
