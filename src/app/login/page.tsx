"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Mail, Radar } from "lucide-react";
import { LuxuryCard } from "@/components/ui/luxury-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";

type Status = "idle" | "pending" | "success" | "error";

function readLinkError(): string | null {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const raw =
    query.get("error_description") ??
    query.get("error") ??
    hash.get("error_description") ??
    hash.get("error");

  if (!raw) return null;

  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw.replace(/\+/g, " ");
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    const err = readLinkError();
    if (err) {
      setLinkError(err);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("pending");
    setError(null);
    setLinkError(null);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Unexpected server response. Please try again.");
      }

      const result = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(result.error ?? "Failed to send magic link.");
        return;
      }

      setStatus("success");
      setSuccessMessage(result.message ?? `Magic link sent to ${email}.`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const isPending = status === "pending";
  const formError = error ?? linkError;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Radar className="h-6 w-6 text-accent" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            SpyOutreach
          </span>
        </div>

        <LuxuryCard className="p-6">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 px-2 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <p className="text-sm font-medium text-foreground">Check your inbox</p>
              <p className="text-sm text-muted">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="text-lg font-medium text-foreground">Sign in</h1>
                <p className="mt-1 text-sm text-muted">
                  We&apos;ll email you a magic link, no password needed.
                </p>
              </div>

              {formError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <p className="text-sm text-danger">{formError}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted" htmlFor="email">
                  Email address
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border-strong bg-background px-3.5 py-3 focus-within:border-accent">
                  <Mail className="h-4 w-4 shrink-0 text-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-dim focus:outline-none"
                  />
                </div>
              </div>

              <ShimmerButton type="submit" disabled={isPending} className="w-full">
                {isPending ? "Sending..." : "Send Magic Link"}
                <ArrowRight className="h-4 w-4" />
              </ShimmerButton>
            </form>
          )}
        </LuxuryCard>
      </div>
    </main>
  );
}
