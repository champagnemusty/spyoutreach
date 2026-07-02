import type { HTMLAttributes } from "react";

export function LuxuryChip({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="luxury-chip">
      <div className={`luxury-chip-inner ${className}`} {...props}>
        {children}
      </div>
    </div>
  );
}
