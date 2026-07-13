"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Lock, Mail, Radar } from "lucide-react";
import { LuxuryCard } from "@/components/ui/luxury-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";

type Mode = "signin" | "signup";
type Status = "idle" | "pending" | "info";

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
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    const err = readLinkError();
    if (err) {
      setError(err);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("pending");
    setError(null);

    try {
      const res = await fetch(mode === "signin" ? "/api/auth/signin" : "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Unexpected server response. Please try again.");
      }

      const result = await res.json();

      if (!res.ok) {
        setStatus("idle");
        setError(result.error ?? "Something went wrong.");
        return;
      }

      if (mode === "signup" && result.requiresConfirmation) {
        setStatus("info");
        setInfoMessage(result.message);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function toggleMode() {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
    setStatus("idle");
  }

  const isPending = status === "pending";

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6">
      <div className="ambient-glow -top-10 left-1/4 h-72 w-72" />
      <div className="ambient-glow bottom-0 right-1/4 h-72 w-72" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Radar className="h-6 w-6 text-accent" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            SpyOutreach
          </span>
        </div>

        <LuxuryCard className="p-6">
          {status === "info" ? (
            <div className="flex flex-col items-center gap-3 px-2 py-4 text-center">
              <p className="text-sm font-medium text-foreground">Almost there</p>
              <p className="text-sm text-muted">{infoMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="text-lg font-medium text-foreground">
                  {mode === "signin" ? "Sign in" : "Create your account"}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  {mode === "signin"
                    ? "Sign in with your email and password."
                    : "Set a password, no email confirmation needed."}
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <p className="text-sm text-danger">{error}</p>
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

              <div>
                <label className="text-xs font-medium text-muted" htmlFor="password">
                  Password
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border-strong bg-background px-3.5 py-3 focus-within:border-accent">
                  <Lock className="h-4 w-4 shrink-0 text-muted" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={mode === "signup" ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-dim focus:outline-none"
                  />
                </div>
              </div>

              <ShimmerButton type="submit" disabled={isPending} className="w-full">
                {isPending ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </ShimmerButton>

              <button
                type="button"
                onClick={toggleMode}
                className="w-full text-center text-xs text-muted transition-colors hover:text-foreground"
              >
                {mode === "signin"
                  ? "Don't have an account? Create one"
                  : "Already have an account? Sign in"}
              </button>
            </form>
          )}
        </LuxuryCard>
      </div>
    </main>
  );
}
