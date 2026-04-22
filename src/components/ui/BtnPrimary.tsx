import type { ButtonHTMLAttributes } from "react";

type Size = "md" | "lg";

export interface BtnPrimaryProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
}

export function BtnPrimary({
  size = "md",
  className = "",
  ...props
}: BtnPrimaryProps) {
  const sizing =
    size === "lg" ? "px-7 py-[14px] text-[15px]" : "px-5 py-3 text-[13px]";
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full bg-ink text-bg font-semibold tracking-tight transition-all duration-200 hover:scale-[1.02] hover:shadow-[var(--shadow-card)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizing} ${className}`}
      {...props}
    />
  );
}
