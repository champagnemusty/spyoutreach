import type { HTMLAttributes } from "react";

export function LuxuryCard({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="luxury-border">
      <div className={`luxury-border-inner ${className}`} {...props}>
        {children}
      </div>
    </div>
  );
}
