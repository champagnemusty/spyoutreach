"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2, Mail, Radar } from "lucide-react";
import { signInWithMagicLink, type MagicLinkState } from "@/app/auth/actions";
import { LuxuryCard } from "@/components/ui/luxury-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const initialState: MagicLinkState = { status: "idle", message: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInWithMagicLink, initialState);

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
          {state.status === "success" ? (
            <div className="flex flex-col items-center gap-3 px-2 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <p className="text-sm font-medium text-foreground">Check your inbox</p>
              <p className="text-sm text-muted">{state.message}</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              <div>
                <h1 className="text-lg font-medium text-foreground">Sign in</h1>
                <p className="mt-1 text-sm text-muted">
                  We&apos;ll email you a magic link, no password needed.
                </p>
              </div>

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
                    placeholder="you@agency.com"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-dim focus:outline-none"
                  />
                </div>
              </div>

              {state.status === "error" && (
                <p className="text-sm text-danger">{state.message}</p>
              )}

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
