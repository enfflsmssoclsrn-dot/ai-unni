import type { CSSProperties } from "react";

export function NyangHead({
  size = 80,
  eyeColor = "#F7C948",
  style,
}: {
  size?: number;
  eyeColor?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      style={{ display: "block", ...style }}
      aria-hidden
    >
      <path
        d="M14 74 C 6 50, 6 36, 14 26 C 10 14, 18 6, 26 14 C 32 10, 48 10, 54 14 C 62 6, 70 14, 66 26 C 74 36, 74 50, 66 74 Z"
        fill="#0B0B0E"
      />
      <ellipse cx="30" cy="40" rx="5" ry="7" fill={eyeColor} />
      <ellipse cx="50" cy="40" rx="5" ry="7" fill={eyeColor} />
      <path d="M29 36 L 29 46 M 49 36 L 49 46" stroke="#0B0B0E" strokeWidth="1.4" />
      <path d="M37 52 L 43 52 L 40 56 Z" fill="#E94B6A" />
    </svg>
  );
}

export function NyangEyes({
  size = 40,
  color = "#F7C948",
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 40 20"
      style={{ display: "block", ...style }}
      aria-hidden
    >
      <ellipse cx="12" cy="10" rx="4" ry="6" fill={color} />
      <ellipse cx="28" cy="10" rx="4" ry="6" fill={color} />
      <path d="M12 6 L 12 14 M 28 6 L 28 14" stroke="#0B0B0E" strokeWidth="1.2" />
    </svg>
  );
}

export function NyangPaw({
  size = 40,
  color = "#0B0B0E",
  pad = "#E94B6A",
  style,
}: {
  size?: number;
  color?: string;
  pad?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ display: "block", ...style }}
      aria-hidden
    >
      <circle cx="10" cy="14" r="4" fill={color} />
      <circle cx="20" cy="10" r="4.2" fill={color} />
      <circle cx="30" cy="14" r="4" fill={color} />
      <ellipse cx="20" cy="28" rx="10" ry="8" fill={color} />
      <ellipse cx="20" cy="28" rx="4" ry="3" fill={pad} opacity="0.65" />
    </svg>
  );
}

export function NyangHero({
  width = 520,
  accent = { a: "#F7C948", b: "#E94B6A", c: "#FF7A3D", d: "#B388EB" },
  style,
}: {
  width?: number;
  accent?: { a: string; b: string; c: string; d: string };
  style?: CSSProperties;
}) {
  return (
    <svg
      width={width}
      height={width * 1.15}
      viewBox="0 0 520 600"
      style={{ display: "block", ...style }}
      aria-hidden
    >
      <rect x="0" y="0" width="260" height="200" fill={accent.d} />
      <rect x="260" y="0" width="260" height="280" fill={accent.a} />
      <rect x="0" y="200" width="180" height="400" fill={accent.b} />
      <rect x="180" y="280" width="160" height="320" fill={accent.c} />
      <rect x="340" y="280" width="180" height="320" fill={accent.a} opacity="0.75" />
      <g>
        <path
          d="M130 600 C 110 460, 110 380, 130 320 C 80 300, 60 240, 80 180 C 100 120, 160 80, 240 80 C 240 60, 250 40, 265 40 C 275 40, 280 55, 278 80 C 290 80, 300 80, 312 82 C 310 60, 320 42, 335 42 C 350 42, 355 60, 350 84 C 420 100, 470 160, 470 230 C 470 280, 440 320, 400 330 C 410 400, 410 500, 400 600 Z"
          fill="#0B0B0E"
        />
        <ellipse cx="215" cy="195" rx="22" ry="28" fill={accent.a} />
        <ellipse cx="310" cy="195" rx="22" ry="28" fill={accent.a} />
        <path d="M213 180 Q 215 210, 217 210 L 217 180 Z" fill="#0B0B0E" />
        <path d="M308 180 Q 310 210, 312 210 L 312 180 Z" fill="#0B0B0E" />
        <path d="M255 235 L 270 235 L 262 248 Z" fill={accent.b} />
        <path
          d="M262 248 Q 255 260, 248 256 M 262 248 Q 269 260, 276 256"
          stroke="#1E1E25"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
