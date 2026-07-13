import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileDown,
  FileText,
  Radar,
  Search,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { LuxuryCard } from "@/components/ui/luxury-card";

const PACKAGES = [
  { name: "Starter", credits: 20, price: 9 },
  { name: "Growth", credits: 60, price: 24, highlight: true },
  { name: "Agency", credits: 150, price: 49 },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              SpyOutreach
            </span>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-border-strong px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-3xl px-6 py-24 text-center">
        <div className="ambient-glow -top-10 left-1/4 h-72 w-72" />
        <div className="ambient-glow bottom-0 right-1/4 h-72 w-72" />

        <div className="relative">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Clean leads. Decode their ad strategy.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted">
            Built for agencies that move fast. Turn messy B2B lists into clean data, and turn any
            competitor into a ready-to-pitch ad strategy brief.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="rounded-lg border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              See Pricing
            </a>
          </div>
          <p className="mt-4 text-xs text-muted">
            3 free credits on sign up. No credit card needed.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <LuxuryCard className="flex flex-col p-6 lg:col-span-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover">
              <Upload className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mt-4 text-base font-medium text-foreground">Lead Cleanser</h3>
            <p className="mt-2 max-w-md text-sm text-muted">
              Upload a raw B2B list (CSV or JSON). We strip legal suffixes from company names and
              flag malformed emails — clean data out, in seconds.
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-lg border border-border-strong bg-background px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-hover">
                <FileText className="h-4 w-4 text-muted" />
              </div>
              <span className="font-mono text-xs text-muted">leads_raw.csv</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="font-mono text-xs text-accent">leads_clean.csv</span>
            </div>
          </LuxuryCard>

          <LuxuryCard className="flex flex-col p-6 lg:col-span-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mt-4 text-base font-medium text-foreground">Spy Brief Generator</h3>
            <p className="mt-2 text-sm text-muted">
              Drop in a competitor&apos;s name or URL and get a 5-page, print-ready ad strategy
              brief — AI-analyzed, grounded in their real site.
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-lg border border-border-strong bg-background px-3.5 py-3">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="truncate font-mono text-xs text-muted">competitor.com</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
              <FileDown className="h-3.5 w-3.5 shrink-0 text-accent" />
            </div>
          </LuxuryCard>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Prepaid credits, no subscription
          </h2>
          <p className="mt-2 text-sm text-muted">
            Pay once, use your credits whenever. Credits never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <LuxuryCard
              key={pkg.name}
              className={`flex flex-col p-6 ${pkg.highlight ? "shadow-2xl shadow-accent/10 sm:-translate-y-3" : ""}`}
            >
              {pkg.highlight && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-white">
                  Most popular
                </span>
              )}

              <h3 className="text-base font-medium text-foreground">{pkg.name}</h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-foreground">
                  ${pkg.price}
                </span>
                <span className="text-sm text-muted">one-time</span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <Zap className="h-3.5 w-3.5 text-accent" />
                <span>{pkg.credits} credits</span>
              </div>

              <div className="mt-5 flex items-start gap-2 text-sm text-muted">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                <span>Never expires</span>
              </div>

              <Link
                href="/login"
                className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Get Started
              </Link>
            </LuxuryCard>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-24 text-center">
        <LuxuryCard className="flex flex-col items-center gap-3 p-8">
          <Sparkles className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-medium text-foreground">
            Free sample: your competitor&apos;s ad strategy brief
          </h2>
          <p className="max-w-md text-sm text-muted">
            Sign up, get 3 free credits, and generate your first Spy Brief on us — no card
            required.
          </p>
          <Link
            href="/login"
            className="mt-2 flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Try It Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </LuxuryCard>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-xs text-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} SpyOutreach</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/refund" className="transition-colors hover:text-foreground">
              Refunds
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
