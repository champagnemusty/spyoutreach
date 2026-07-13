import type { HTMLAttributes } from "react";

export function LuxuryChip({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`luxury-chip ${className}`} {...props}>
      {children}
    </div>
  );
}
