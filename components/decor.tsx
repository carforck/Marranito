// Elementos decorativos del hero (estilo memphis) y avatar de icono por color.

export function HeroDecor() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 390 300"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" fill="none">
        <circle cx="330" cy="70" r="46" />
        <path d="M20 250 q10 -12 20 0 t20 0 t20 0" />
        <path d="M300 250 q10 -12 20 0 t20 0" />
      </g>
      <g fill="#ffffff" fillOpacity="0.14">
        <circle cx="352" cy="150" r="4" />
        <circle cx="368" cy="150" r="4" />
        <circle cx="352" cy="166" r="4" />
        <circle cx="368" cy="166" r="4" />
        <circle cx="336" cy="150" r="4" />
        <circle cx="336" cy="166" r="4" />
        <circle cx="40" cy="60" r="4" />
        <circle cx="56" cy="60" r="4" />
        <circle cx="40" cy="76" r="4" />
      </g>
      <g stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" fill="none">
        <path d="M70 200 l14 8 -14 8" />
        <path d="M310 40 l14 8 -14 8" />
      </g>
    </svg>
  );
}

const COLORS = [
  { bg: "#efecfe", fg: "#6c5ce7" },
  { bg: "#e6f9ee", fg: "#22c55e" },
  { bg: "#fff3e0", fg: "#f59e0b" },
  { bg: "#ffe9ee", fg: "#f43f5e" },
  { bg: "#e7f0ff", fg: "#3b82f6" },
  { bg: "#f3e8ff", fg: "#a855f7" },
];

function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function IconAvatar({ name }: { name: string }) {
  const c = colorFor(name);
  const initial = name.trim().charAt(0).toUpperCase() || "•";
  return (
    <div
      className="flex h-11 w-11 items-center justify-center rounded-2xl text-base font-bold"
      style={{ background: c.bg, color: c.fg }}
    >
      {initial}
    </div>
  );
}
