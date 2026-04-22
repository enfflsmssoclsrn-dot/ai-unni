import type { ButtonHTMLAttributes } from "react";

type Size = "md" | "lg";

export interface BtnGhostProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
}

export function BtnGhost({
  size = "md",
  className = "",
  ...props
}: BtnGhostProps) {
  const sizing =
    size === "lg" ? "px-7 py-[14px] text-[15px]" : "px-5 py-3 text-[13px]";
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full border border-ink bg-transparent text-ink font-semibold tracking-tight transition-all duration-200 hover:scale-[1.02] hover:bg-ink/5 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizing} ${className}`}
      {...props}
    />
  );
}
