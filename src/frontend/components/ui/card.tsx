import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
};

export function Card({ children, className = "", elevated = false }: CardProps) {
  const surface = elevated ? "yin-card" : "border border-yin-border shadow-sm";
  return (
    <div className={`rounded-2xl bg-yin-surface ${surface} ${className}`}>{children}</div>
  );
}
