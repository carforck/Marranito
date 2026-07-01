import { getPool } from "@/lib/db";
import type { Store } from "./index";
import type { Contribution, Member, FundSummary } from "@/lib/types";

const CYCLE_YEAR = 2026;

// Mapea una fila de la BD a Contribution. monto viene como string (bigint).
function rowToContribution(r: Record<string, unknown>): Contribution {
  return {
    id: String(r.id),
    memberId: String(r.miembro_id),
    memberName: String(r.nombre),
    amount: Number(r.monto),
    date: String(r.fecha).slice(0, 10),
    status: r.estado as Contribution["status"],
    note: r.nota ? String(r.nota) : undefined,
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export class SupabaseStore implements Store {
  async getSummary(): Promise<FundSummary> {
    const pool = getPool();
    const { rows } = await pool.query(
      `select
         coalesce(sum(monto) filter (where estado='confirmado'),0)::bigint as confirmado,
         coalesce(sum(monto) filter (where estado='pendiente'),0)::bigint as pendiente,
         count(*) filter (where estado='confirmado') as n_confirmados
       from public.aportes`,
    );
    const { rows: mc } = await pool.query(
      `select count(*)::int as n from public.miembros`,
    );
    const r = rows[0];
    return {
      totalConfirmed: Number(r.confirmado),
      totalPending: Number(r.pendiente),
      memberCount: mc[0].n,
      contributionCount: Number(r.n_confirmados),
      cycleYear: CYCLE_YEAR,
    };
  }

  private async list(where: string): Promise<Contribution[]> {
    const pool = getPool();
    const { rows } = await pool.query(
      `select a.*, m.nombre
         from public.aportes a
         join public.miembros m on m.id = a.miembro_id
         ${where}
        order by a.fecha desc, a.created_at desc`,
    );
    return rows.map(rowToContribution);
  }

  listConfirmed(): Promise<Contribution[]> {
    return this.list("where a.estado = 'confirmado'");
  }

  listAll(): Promise<Contribution[]> {
    return this.list("");
  }

  async listMembers(): Promise<Member[]> {
    const pool = getPool();
    const { rows } = await pool.query(
      `select id, nombre, created_at from public.miembros order by nombre asc`,
    );
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.nombre),
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  async addMember(name: string): Promise<Member> {
    const pool = getPool();
    const { rows } = await pool.query(
      `insert into public.miembros (nombre) values ($1) returning id, nombre, created_at`,
      [name.trim()],
    );
    const r = rows[0];
    return {
      id: String(r.id),
      name: String(r.nombre),
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  async addContribution(input: {
    memberId: string;
    amount: number;
    date: string;
    confirmNow?: boolean;
  }): Promise<Contribution> {
    const pool = getPool();
    const estado = input.confirmNow ? "confirmado" : "pendiente";
    const { rows } = await pool.query(
      `insert into public.aportes (miembro_id, monto, fecha, estado, ciclo_id)
       values ($1,$2,$3,$4, (select id from public.ciclos where anio=$5))
       returning *,
         (select nombre from public.miembros where id=$1) as nombre`,
      [input.memberId, input.amount, input.date, estado, CYCLE_YEAR],
    );
    return rowToContribution(rows[0]);
  }

  async confirmContribution(id: string): Promise<void> {
    const pool = getPool();
    await pool.query(
      `update public.aportes set estado='confirmado'
        where id=$1 and estado='pendiente'`,
      [id],
    );
  }

  async reverseContribution(id: string, note: string): Promise<void> {
    const pool = getPool();
    // Append-only: no se borra, se marca reversado con motivo.
    await pool.query(
      `update public.aportes set estado='reversado', nota=$2 where id=$1`,
      [id, note.trim()],
    );
  }
}
