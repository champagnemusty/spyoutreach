import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EXPIRED_LINK_MESSAGE = "Your magic link is invalid or has expired. Please request a new one.";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const queryError = searchParams.get("error_description") ?? searchParams.get("error");
  if (queryError) {
    const message = queryError.replace(/\+/g, " ");
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(EXPIRED_LINK_MESSAGE)}`);
}
