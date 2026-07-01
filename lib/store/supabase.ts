import { getPool } from "@/lib/db";
import { CYCLE_YEAR } from "@/lib/constants";
import type { Store, NewContribution, MemberInput } from "./index";
import type { Contribution, Member, FundSummary } from "@/lib/types";

function rowToContribution(r: Record<string, unknown>): Contribution {
  return {
    id: String(r.id),
    memberId: String(r.miembro_id),
    memberName: String(r.nombre),
    memberEmoji: String(r.emoji ?? "🐷"),
    memberColor: String(r.color ?? "#6c5ce7"),
    amount: Number(r.monto),
    date: String(r.fecha).slice(0, 10),
    status: r.estado as Contribution["status"],
    descripcion: r.descripcion ? String(r.descripcion) : undefined,
    metodo: r.metodo ? (String(r.metodo) as Contribution["metodo"]) : undefined,
    soporteUrl: r.soporte_url ? String(r.soporte_url) : undefined,
    note: r.nota ? String(r.nota) : undefined,
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

function rowToMember(r: Record<string, unknown>): Member {
  return {
    id: String(r.id),
    name: String(r.nombre),
    emoji: String(r.emoji ?? "🐷"),
    color: String(r.color ?? "#6c5ce7"),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

const JOIN = `select a.*, m.nombre, m.emoji, m.color
  from public.aportes a join public.miembros m on m.id = a.miembro_id`;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s: string) => UUID_RE.test(s);

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

  private async list(where: string, params: unknown[] = []): Promise<Contribution[]> {
    const { rows } = await getPool().query(
      `${JOIN} ${where} order by a.fecha desc, a.created_at desc`,
      params,
    );
    return rows.map(rowToContribution);
  }

  listConfirmed() {
    return this.list("where a.estado = 'confirmado'");
  }
  listAll() {
    return this.list("");
  }
  listByMember(memberId: string) {
    return this.list("where a.miembro_id = $1", [memberId]);
  }

  async getContribution(id: string): Promise<Contribution | null> {
    if (!isUuid(id)) return null;
    const rows = await this.list("where a.id = $1", [id]);
    return rows[0] ?? null;
  }

  async listMembers(): Promise<Member[]> {
    const { rows } = await getPool().query(
      `select * from public.miembros order by nombre asc`,
    );
    return rows.map(rowToMember);
  }

  async getMember(id: string): Promise<Member | null> {
    if (!isUuid(id)) return null;
    const { rows } = await getPool().query(
      `select * from public.miembros where id = $1`,
      [id],
    );
    return rows[0] ? rowToMember(rows[0]) : null;
  }

  async addMember(input: MemberInput): Promise<Member> {
    const { rows } = await getPool().query(
      `insert into public.miembros (nombre, emoji, color)
       values ($1,$2,$3) returning *`,
      [input.name.trim(), input.emoji, input.color],
    );
    return rowToMember(rows[0]);
  }

  async updateMember(id: string, input: MemberInput): Promise<void> {
    await getPool().query(
      `update public.miembros set nombre=$2, emoji=$3, color=$4 where id=$1`,
      [id, input.name.trim(), input.emoji, input.color],
    );
  }

  async deleteMember(id: string): Promise<void> {
    // Solo se puede borrar si no tiene aportes (protege el historial).
    await getPool().query(
      `delete from public.miembros where id=$1
        and not exists (select 1 from public.aportes where miembro_id=$1)`,
      [id],
    );
  }

  async addContribution(input: NewContribution): Promise<Contribution> {
    const estado = input.confirmNow ? "confirmado" : "pendiente";
    // on conflict (client_token) do nothing → si se reenvía el mismo token,
    // no se duplica. Luego resolvemos el id (nuevo o el existente).
    const { rows } = await getPool().query(
      `insert into public.aportes
         (miembro_id, monto, fecha, estado, descripcion, metodo, soporte_url, client_token, ciclo_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,(select id from public.ciclos where anio=$9))
       on conflict (client_token) do nothing
       returning id`,
      [
        input.memberId,
        input.amount,
        input.date,
        estado,
        input.descripcion ?? null,
        input.metodo ?? null,
        input.soporteUrl ?? null,
        input.clientToken ?? null,
        CYCLE_YEAR,
      ],
    );
    let id = rows[0]?.id as string | undefined;
    if (!id && input.clientToken) {
      const dup = await getPool().query(
        `select id from public.aportes where client_token = $1`,
        [input.clientToken],
      );
      id = dup.rows[0]?.id;
    }
    const list = await this.list("where a.id = $1", [id]);
    return list[0];
  }

  async confirmContribution(id: string): Promise<void> {
    await getPool().query(
      `update public.aportes set estado='confirmado' where id=$1 and estado='pendiente'`,
      [id],
    );
  }

  async reverseContribution(id: string, note: string): Promise<void> {
    await getPool().query(
      `update public.aportes set estado='reversado', nota=$2 where id=$1`,
      [id, note.trim()],
    );
  }

  async getMonthlyQuota(): Promise<number> {
    const { rows } = await getPool().query(
      `select meta_por_miembro from public.ciclos where anio=$1`,
      [CYCLE_YEAR],
    );
    return Number(rows[0]?.meta_por_miembro ?? 0);
  }

  async setMonthlyQuota(amount: number): Promise<void> {
    await getPool().query(
      `update public.ciclos set meta_por_miembro=$2 where anio=$1`,
      [CYCLE_YEAR, amount || null],
    );
  }
}
