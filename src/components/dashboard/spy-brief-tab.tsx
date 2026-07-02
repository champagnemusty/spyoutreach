"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";

const REPORT_SECTIONS = [
  "Positioning & brand narrative analysis",
  "Ad creative breakdown by format and hook",
  "Messaging angles ranked by frequency",
  "Funnel and offer teardown",
  "Recommended strategy for your pitch",
];

function downloadPdf(pdfBase64: string, filename: string) {
  const byteChars = atob(pdfBase64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function SpyBriefTab({ onGenerated }: { onGenerated: (credits: number) => void }) {
  const [target, setTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!target.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/spy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim() }),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Failed to generate brief.");
      }

      downloadPdf(result.pdfBase64, result.filename);
      onGenerated(result.credits);
      setTarget("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Spy Brief Generator</h2>
        <p className="mt-1 text-sm text-muted">
          Drop in a competitor and get a 5-page, print-ready ad strategy brief.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <label className="text-xs font-medium text-muted" htmlFor="brand-target">
          Competitor brand name or URL
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-border-strong bg-background px-3.5 py-3 focus-within:border-accent">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            id="brand-target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. gymshark.com or Gymshark"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-dim focus:outline-none"
          />
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={!target.trim() || isSubmitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Spy Brief
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-xs font-medium text-muted">What&rsquo;s in the PDF</p>
        <ol className="mt-3 space-y-2.5">
          {REPORT_SECTIONS.map((section, i) => (
            <li key={section} className="flex items-start gap-3 text-sm text-muted">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-strong text-[11px] text-foreground">
                {i + 1}
              </span>
              <span>{section}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs text-muted">Uses 1 credit per report</p>
    </div>
  );
}
