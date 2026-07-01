import type { MonthPoint } from "@/lib/analytics";
import { formatCOP } from "@/lib/money";

// Gráfica de área del ahorro acumulado por mes. SVG puro, sin dependencias.
export function SavingsChart({
  data,
  color = "var(--brand)",
  title = "AHORRO ACUMULADO",
}: {
  data: MonthPoint[];
  color?: string;
  title?: string;
}) {
  const W = 320;
  const H = 150;
  const padX = 8;
  const padTop = 16;
  const padBottom = 24;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const max = Math.max(1, ...data.map((d) => d.cumulative));
  const n = data.length;

  const x = (i: number) => (n <= 1 ? padX + innerW / 2 : padX + (innerW * i) / (n - 1));
  const y = (v: number) => padTop + innerH - (innerH * v) / max;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.cumulative).toFixed(1)}`)
    .join(" ");
  const areaPath =
    n > 0
      ? `${linePath} L ${x(n - 1).toFixed(1)} ${padTop + innerH} L ${x(0).toFixed(1)} ${
          padTop + innerH
        } Z`
      : "";

  const lastIdx = n - 1;

  return (
    <div className="themed rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-1 flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)]">
            {title}
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums">
            {formatCOP(data.at(-1)?.cumulative ?? 0)}
          </p>
        </div>
        <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand-soft-fg)]">
          {data.length} {data.length === 1 ? "mes" : "meses"}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Ahorro acumulado por mes">
        <defs>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grilla horizontal */}
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

        {n > 0 && <path d={areaPath} fill="url(#fill)" />}
        {n > 0 && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* punto final destacado */}
        {n > 0 && (
          <>
            <circle cx={x(lastIdx)} cy={y(data[lastIdx].cumulative)} r="6" fill={color} fillOpacity="0.2" />
            <circle cx={x(lastIdx)} cy={y(data[lastIdx].cumulative)} r="3.5" fill={color} />
          </>
        )}

        {/* etiquetas de mes */}
        {data.map((d, i) => (
          <text
            key={d.key}
            x={x(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize="9"
            fill="var(--muted)"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
