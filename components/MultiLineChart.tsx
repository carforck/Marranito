import type { MemberSeries } from "@/lib/analytics";
import { formatCOP } from "@/lib/money";

// Gráfica de acumulado por compañero: una línea por persona, en su color.
export function MultiLineChart({
  labels,
  series,
  total,
}: {
  labels: string[];
  series: MemberSeries[];
  total: number;
}) {
  const W = 340;
  const H = 170;
  const padX = 10;
  const padTop = 14;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const n = labels.length;
  const max = Math.max(1, ...series.flatMap((s) => s.cumulative));
  const x = (i: number) => (n <= 1 ? padX + innerW / 2 : padX + (innerW * i) / (n - 1));
  const y = (v: number) => padTop + innerH - (innerH * v) / max;

  const linePath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  return (
    <div className="themed rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-1 flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)]">
            AHORRO ACUMULADO POR COMPAÑERO
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums">{formatCOP(total)}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Ahorro acumulado por compañero">
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={W - padX}
            y1={padTop + innerH * t}
            y2={padTop + innerH * t}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}

        {series.map((s) => (
          <g key={s.memberId}>
            <path
              d={linePath(s.cumulative)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={x(n - 1)} cy={y(s.cumulative[n - 1])} r="3" fill={s.color} />
          </g>
        ))}

        {labels.map((m, i) => (
          <text key={m + i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--muted)">
            {m}
          </text>
        ))}
      </svg>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {series.map((s) => (
          <span key={s.memberId} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.emoji} {s.name}
          </span>
        ))}
        {series.length === 0 && (
          <span className="text-xs text-[var(--muted)]">Aún no hay aportes confirmados.</span>
        )}
      </div>
    </div>
  );
}
