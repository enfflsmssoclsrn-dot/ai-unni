import type { ReactNode } from "react";

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-bg/70 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-sub ${className}`}
    >
      {children}
    </span>
  );
}
