"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Radar, RefreshCw, User, Zap } from "lucide-react";
import { LeadCleanserTab } from "./lead-cleanser-tab";
import { SpyBriefTab } from "./spy-brief-tab";
import { BuyCreditsTab } from "./buy-credits-tab";
import { LuxuryChip } from "@/components/ui/luxury-chip";

type Tab = "cleanser" | "brief" | "credits";

const TABS: { id: Tab; label: string }[] = [
  { id: "cleanser", label: "Lead Cleanser" },
  { id: "brief", label: "Spy Brief Generator" },
  { id: "credits", label: "Buy Credits" },
];

export function DashboardShell({
  credits,
  email,
  userId,
}: {
  credits: number;
  email: string;
  userId: string;
}) {
  const [tab, setTab] = useState<Tab>("cleanser");
  const [isChecking, setIsChecking] = useState(false);
  const [liveCredits, setLiveCredits] = useState(credits);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchase") === "success") {
      setShowPurchaseSuccess(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function checkPayment() {
    setIsChecking(true);
    try {
      await fetch("/api/payments/check", { method: "POST" });
    } catch {
      // API route ships with the Lemon Squeezy integration
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              SpyOutreach
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <User className="h-3.5 w-3.5" />
              <span>{email}</span>
            </div>
            <LuxuryChip className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-foreground">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span>{liveCredits} credits</span>
            </LuxuryChip>
            <button
              onClick={checkPayment}
              disabled={isChecking}
              className="flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
              Check My Payment &amp; Refill Credits
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {showPurchaseSuccess && (
          <div className="mb-8 flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/10 px-3.5 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <p className="text-sm text-success">
              Payment received! Your credits will update within a few seconds — refresh if you
              don&apos;t see them yet.
            </p>
          </div>
        )}

        <LuxuryChip className="mb-10 inline-flex p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </LuxuryChip>

        {tab === "cleanser" && <LeadCleanserTab onCleaned={setLiveCredits} />}
        {tab === "brief" && <SpyBriefTab onGenerated={setLiveCredits} />}
        {tab === "credits" && <BuyCreditsTab userId={userId} email={email} />}
      </main>
    </div>
  );
}
