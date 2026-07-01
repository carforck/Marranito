import type { Contribution } from "./types";

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

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

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
