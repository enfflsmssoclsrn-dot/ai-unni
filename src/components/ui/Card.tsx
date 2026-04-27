import type { HTMLAttributes, ReactNode } from "react";

type Variant = "plain" | "alt";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Card({
  variant = "plain",
  className = "",
  children,
  ...props
}: CardProps) {
  const bg = variant === "alt" ? "bg-bg-alt" : "bg-white";
  return (
    <div
      className={`${bg} rounded-[var(--radius-lg)] border border-line shadow-[var(--shadow-card)] p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
