import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";

export function LegalPageLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              SpyOutreach
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back home
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-xs text-muted">Last updated {updatedAt}</p>

        <div className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-muted">
          {children}
        </div>
      </article>
    </main>
  );
}
