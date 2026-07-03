import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_UPSTREAM_ERROR =
  "We couldn't reach the authentication service. Please try again in a moment.";

function isLeakedInternalError(message: string): boolean {
  return /unexpected token|<!doctype|is not valid json|failed to fetch/i.test(message);
}

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) return `https://${productionUrl}`;

  const deploymentUrl = process.env.VERCEL_URL?.trim();
  if (deploymentUrl) return `https://${deploymentUrl}`;

  return "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    let email = "";
    try {
      const body = await request.json();
      email = String(body?.email ?? "").trim();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = await createClient();
    const siteUrl = resolveSiteUrl();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      if (isLeakedInternalError(error.message)) {
        console.error("[api/auth/signin] Supabase auth upstream returned a non-JSON response:", error.message);
        return NextResponse.json({ error: GENERIC_UPSTREAM_ERROR }, { status: 502 });
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: `Magic link sent to ${email}.` });
  } catch (err) {
    console.error("[api/auth/signin] Unhandled exception:", err);
    return NextResponse.json(
      { error: "Something went wrong sending the magic link. Please try again." },
      { status: 500 },
    );
  }
}
