import type { HTMLAttributes } from "react";

export function LuxuryCard({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`luxury-border ${className}`} {...props}>
      {children}
    </div>
  );
}
