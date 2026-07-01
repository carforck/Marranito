import type { PaymentMethod } from "./types";

export const CYCLE_YEAR = 2026;

export const METODOS: { value: PaymentMethod; label: string }[] = [
  { value: "nequi", label: "Nequi" },
  { value: "bancolombia", label: "Bancolombia" },
  { value: "daviplata", label: "Daviplata" },
  { value: "efectivo", label: "Efectivo" },
  { value: "otro", label: "Otro" },
];

export function metodoLabel(m?: string): string {
  return METODOS.find((x) => x.value === m)?.label ?? "";
}

// Paleta de colores propios de cada compañero (distinguibles en la gráfica).
export const MEMBER_COLORS = [
  "#6c5ce7", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6",
  "#ec4899", "#14b8a6", "#8b5cf6", "#f97316", "#0ea5e9",
  "#84cc16", "#e11d48",
];

// Emojis de personaje/animal tipo iPhone para el avatar.
export const MEMBER_EMOJIS = [
  "🐷","🐶","🐱","🦊","🐻","🐼","🐨","🐯","🦁","🐮",
  "🐸","🐵","🐰","🐹","🐔","🦉","🦄","🐙","🐢","🐧",
  "🐴","🐝","🦋","🐬","🦈","🐳","🦩","🦚","🐲","🌟",
];
