// Tipos del dominio. Montos SIEMPRE en pesos enteros (COP).

export type ContributionStatus = "pendiente" | "confirmado" | "reversado";
export type PaymentMethod =
  | "efectivo"
  | "nequi"
  | "bancolombia"
  | "daviplata"
  | "otro";

export interface Member {
  id: string;
  name: string;
  emoji: string; // avatar tipo emoji
  color: string; // color propio (hex) para gráficas/perfil
  createdAt: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  memberEmoji: string;
  memberColor: string;
  amount: number; // pesos enteros
  date: string; // ISO (yyyy-mm-dd)
  status: ContributionStatus;
  descripcion?: string; // de dónde/cómo pagó
  metodo?: PaymentMethod;
  soporteUrl?: string; // captura del comprobante
  note?: string; // motivo de reversa
  clientToken?: string; // idempotencia
  createdAt: string;
}

export interface FundSummary {
  totalConfirmed: number;
  totalPending: number;
  memberCount: number;
  contributionCount: number;
  cycleYear: number;
}
