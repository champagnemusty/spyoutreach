import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EXPIRED_LINK_MESSAGE = "Your magic link is invalid or has expired. Please request a new one.";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  const queryError = searchParams.get("error_description") ?? searchParams.get("error");
  if (queryError) {
    const message = queryError.replace(/\+/g, " ");
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();

  // Stateless verification — works even if the link is opened in a different
  // browser/device than the one that requested it (no code_verifier cookie
  // needed). This is the path Supabase's email templates should target.
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  // PKCE fallback — only works when completed in the same browser/device
  // that initiated the sign-in (requires the code_verifier cookie).
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(EXPIRED_LINK_MESSAGE)}`);
}
