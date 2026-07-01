import type { Contribution, Member, FundSummary } from "@/lib/types";

// Puerto: lo que la app necesita de un almacén, sin saber si es JSON local o Supabase.
export interface Store {
  getSummary(): Promise<FundSummary>;
  // Vista pública: solo aportes confirmados, sin datos sensibles.
  listConfirmed(): Promise<Contribution[]>;
  // Vista admin: todo, incluyendo pendientes y reversados.
  listAll(): Promise<Contribution[]>;
  listMembers(): Promise<Member[]>;

  addMember(name: string): Promise<Member>;
  // Registra un aporte. Por defecto entra como "pendiente".
  addContribution(input: {
    memberId: string;
    amount: number;
    date: string;
    confirmNow?: boolean;
  }): Promise<Contribution>;
  confirmContribution(id: string): Promise<void>;
  // Append-only: no se borra, se reversa dejando motivo.
  reverseContribution(id: string, note: string): Promise<void>;
}

import { LocalStore } from "./local";
import { SupabaseStore } from "./supabase";
import { hasSupabase } from "@/lib/db";

let instance: Store | null = null;

export function getStore(): Store {
  if (!instance) {
    // Si hay credenciales de Supabase, usamos Postgres; si no, JSON local.
    instance = hasSupabase() ? new SupabaseStore() : new LocalStore();
  }
  return instance;
}
