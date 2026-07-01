// Logo de Marranito: marca geométrica (cabeza de marranito) + wordmark.
// Estilo limpio, una sola forma reconocible, color de acento fuerte.

// Marranito simpático y autocontenido (rosado). Se ve bien sobre
// el degradado morado y sobre fondo blanco.
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
      <path d="M15 15 Q13 24 22 26 Q23 17 15 15 Z" fill="#f47a99" />
      <path d="M49 15 Q51 24 42 26 Q41 17 49 15 Z" fill="#f47a99" />
      {/* cabeza */}
      <circle cx="32" cy="35" r="21" fill="#ff9db3" />
      {/* cachetes */}
      <circle cx="19.5" cy="40" r="4" fill="#ff8199" fillOpacity="0.6" />
      <circle cx="44.5" cy="40" r="4" fill="#ff8199" fillOpacity="0.6" />
      {/* ojos */}
      <circle cx="25" cy="30" r="2.7" fill="#3a2a45" />
      <circle cx="39" cy="30" r="2.7" fill="#3a2a45" />
      <circle cx="26" cy="29.2" r="0.9" fill="#ffffff" />
      <circle cx="40" cy="29.2" r="0.9" fill="#ffffff" />
      {/* hocico */}
      <ellipse cx="32" cy="40.5" rx="10.5" ry="7.5" fill="#f9718f" />
      <ellipse cx="28.5" cy="40.5" rx="1.9" ry="2.4" fill="#c74d69" />
      <ellipse cx="35.5" cy="40.5" rx="1.9" ry="2.4" fill="#c74d69" />
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
