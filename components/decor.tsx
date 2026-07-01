// Elementos decorativos del hero (estilo memphis) y avatar de emoji por color.

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
        <circle cx="352" cy="150" r="4" /><circle cx="368" cy="150" r="4" />
        <circle cx="352" cy="166" r="4" /><circle cx="368" cy="166" r="4" />
        <circle cx="336" cy="150" r="4" /><circle cx="336" cy="166" r="4" />
        <circle cx="40" cy="60" r="4" /><circle cx="56" cy="60" r="4" />
        <circle cx="40" cy="76" r="4" />
      </g>
      <g stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" fill="none">
        <path d="M70 200 l14 8 -14 8" />
        <path d="M310 40 l14 8 -14 8" />
      </g>
    </svg>
  );
}

const SIZES = { sm: "h-9 w-9 text-lg", md: "h-11 w-11 text-xl", lg: "h-16 w-16 text-3xl" };

export function EmojiAvatar({
  emoji,
  color,
  size = "md",
}: {
  emoji: string;
  color: string;
  size?: keyof typeof SIZES;
}) {
  return (
    <div
      className={`flex flex-none items-center justify-center rounded-2xl ${SIZES[size]}`}
      style={{ background: `${color}22`, boxShadow: `inset 0 0 0 1.5px ${color}33` }}
    >
      <span className="leading-none">{emoji || "🐷"}</span>
    </div>
  );
}
