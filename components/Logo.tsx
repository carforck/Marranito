// Logo de Marranito: marca geométrica (cabeza de marranito) + wordmark.
// Estilo limpio, una sola forma reconocible, color de acento fuerte.

export function MarranitoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* orejas */}
      <path d="M16 14 L26 22 L14 26 Z" fill="currentColor" />
      <path d="M48 14 L38 22 L50 26 Z" fill="currentColor" />
      {/* cabeza */}
      <circle cx="32" cy="36" r="20" fill="currentColor" />
      {/* hocico */}
      <ellipse cx="32" cy="40" rx="11" ry="8" fill="#ffffff" fillOpacity="0.92" />
      <circle cx="28" cy="40" r="2.1" fill="currentColor" />
      <circle cx="36" cy="40" r="2.1" fill="currentColor" />
      {/* ojos */}
      <circle cx="24" cy="30" r="2.4" fill="#ffffff" />
      <circle cx="40" cy="30" r="2.4" fill="#ffffff" />
    </svg>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 text-[var(--brand)]">
      <MarranitoMark size={size} />
      <span
        className="font-extrabold tracking-tight text-[var(--foreground)]"
        style={{ fontSize: size * 0.62 }}
      >
        Marranito
      </span>
    </div>
  );
}
