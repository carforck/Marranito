import type { Contribution, Member } from "./types";

/** Meses transcurridos del ciclo (1..12). Si el año ya pasó, 12. */
export function monthsElapsed(year: number, now: Date): number {
  if (now.getFullYear() < year) return 0;
  if (now.getFullYear() > year) return 12;
  return now.getMonth() + 1;
}

export interface QuotaStatus {
  expected: number; // lo que debería llevar hasta hoy
  falta: number; // cuánto le falta (0 si va al día)
  alDia: boolean;
}

/** Estado de cuota de un compañero dado su total confirmado. */
export function quotaStatus(
  total: number,
  monthlyQuota: number,
  monthsSoFar: number,
): QuotaStatus | null {
  if (!monthlyQuota || monthlyQuota <= 0) return null; // sin meta configurada
  const expected = monthlyQuota * monthsSoFar;
  const falta = Math.max(0, expected - total);
  return { expected, falta, alDia: falta === 0 };
}

export interface MemberTotal {
  memberId: string;
  memberName: string;
  total: number;
  count: number;
}

/** Total confirmado por compañero, ordenado de mayor a menor. */
export function memberTotals(confirmed: Contribution[]): MemberTotal[] {
  const map = new Map<string, MemberTotal>();
  for (const c of confirmed) {
    const cur =
      map.get(c.memberId) ??
      { memberId: c.memberId, memberName: c.memberName, total: 0, count: 0 };
    cur.total += c.amount;
    cur.count += 1;
    map.set(c.memberId, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export interface MonthPoint {
  key: string; // "2026-01"
  label: string; // "Ene"
  monthTotal: number; // aportado ese mes
  cumulative: number; // acumulado hasta ese mes
}

export const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export interface MemberSeries {
  memberId: string;
  name: string;
  emoji: string;
  color: string;
  cumulative: number[]; // acumulado por mes (misma longitud que labels)
  total: number;
}

/**
 * Acumulado por compañero, mes a mes. Una serie por persona para la
 * gráfica multi-línea (cada quien con su color).
 */
export function seriesByMember(
  confirmed: Contribution[],
  members: Member[],
  year: number,
  upToMonth = 12,
): { labels: string[]; series: MemberSeries[] } {
  const last = Math.max(1, Math.min(12, upToMonth));
  const labels = MESES.slice(0, last);

  const series: MemberSeries[] = members.map((m) => ({
    memberId: m.id,
    name: m.name,
    emoji: m.emoji,
    color: m.color,
    cumulative: new Array(last).fill(0),
    total: 0,
  }));
  const byId = new Map(series.map((s) => [s.memberId, s]));

  for (const c of confirmed) {
    const [y, mo] = c.date.split("-").map(Number);
    const s = byId.get(c.memberId);
    if (!s || y !== year || mo < 1 || mo > last) continue;
    s.cumulative[mo - 1] += c.amount;
  }
  for (const s of series) {
    let acc = 0;
    for (let i = 0; i < last; i++) {
      acc += s.cumulative[i];
      s.cumulative[i] = acc;
    }
    s.total = acc;
  }
  // Solo quienes han aportado, de mayor a menor.
  return {
    labels,
    series: series.filter((s) => s.total > 0).sort((a, b) => b.total - a.total),
  };
}

/**
 * Serie mensual del ciclo (ene–dic) con lo aportado por mes y el acumulado.
 * Incluye todos los meses hasta el mes actual para que la línea se vea completa.
 */
export function monthlySeries(
  confirmed: Contribution[],
  year: number,
  upToMonth = 12,
): MonthPoint[] {
  const byMonth = new Array(12).fill(0);
  for (const c of confirmed) {
    const [y, m] = c.date.split("-").map(Number);
    if (y === year && m >= 1 && m <= 12) byMonth[m - 1] += c.amount;
  }
  const points: MonthPoint[] = [];
  let acc = 0;
  const last = Math.max(1, Math.min(12, upToMonth));
  for (let i = 0; i < last; i++) {
    acc += byMonth[i];
    points.push({
      key: `${year}-${String(i + 1).padStart(2, "0")}`,
      label: MESES[i],
      monthTotal: byMonth[i],
      cumulative: acc,
    });
  }
  return points;
}
