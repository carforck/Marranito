// Tipos del dominio. Montos SIEMPRE en pesos enteros (centavos no se usan en COP).
// Nunca usar float para dinero.

export type ContributionStatus = "pendiente" | "confirmado" | "reversado";

export interface Member {
  id: string;
  name: string;
  createdAt: string; // ISO
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string; // desnormalizado para la vista pública
  amount: number; // pesos enteros
  date: string; // ISO (fecha del aporte)
  status: ContributionStatus;
  note?: string; // motivo en caso de reversa
  createdAt: string; // ISO (cuándo se registró en el sistema)
}

export interface Cycle {
  id: string;
  year: number;
  goalPerMember?: number; // meta de ahorro por persona (opcional)
  open: boolean;
}

export interface FundSummary {
  totalConfirmed: number; // suma de aportes confirmados (pesos)
  totalPending: number; // suma de aportes pendientes (pesos)
  memberCount: number;
  contributionCount: number; // confirmados
  cycleYear: number;
}
