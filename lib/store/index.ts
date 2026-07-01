import type {
  Contribution,
  Member,
  FundSummary,
  PaymentMethod,
} from "@/lib/types";

export interface NewContribution {
  memberId: string;
  amount: number;
  date: string;
  descripcion?: string;
  metodo?: PaymentMethod;
  soporteUrl?: string;
  confirmNow?: boolean;
}

export interface MemberInput {
  name: string;
  emoji: string;
  color: string;
}

// Puerto: lo que la app necesita de un almacén.
export interface Store {
  getSummary(): Promise<FundSummary>;
  listConfirmed(): Promise<Contribution[]>;
  listAll(): Promise<Contribution[]>;
  listMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | null>;
  listByMember(memberId: string): Promise<Contribution[]>;

  addMember(input: MemberInput): Promise<Member>;
  updateMember(id: string, input: MemberInput): Promise<void>;
  deleteMember(id: string): Promise<void>;

  addContribution(input: NewContribution): Promise<Contribution>;
  confirmContribution(id: string): Promise<void>;
  reverseContribution(id: string, note: string): Promise<void>;

  // Cuota mensual esperada por compañero (0 = sin meta).
  getMonthlyQuota(): Promise<number>;
  setMonthlyQuota(amount: number): Promise<void>;
}

import { LocalStore } from "./local";
import { SupabaseStore } from "./supabase";
import { hasSupabase } from "@/lib/db";

let instance: Store | null = null;

export function getStore(): Store {
  if (!instance) {
    instance = hasSupabase() ? new SupabaseStore() : new LocalStore();
  }
  return instance;
}
