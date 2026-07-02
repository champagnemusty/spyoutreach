import type { ButtonHTMLAttributes } from "react";

export function ShimmerButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`shimmer-button flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
