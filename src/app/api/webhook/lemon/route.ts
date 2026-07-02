import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Lemon Squeezy variant ID -> credits granted. Fill in with real variant IDs
// from the store dashboard; unmatched variants fall back to DEFAULT_CREDITS.
const CREDIT_PACKAGES: Record<string, number> = {
  "1862478": 20,
};
const DEFAULT_CREDITS = 20;

function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest();

  let signature: Buffer;
  try {
    signature = Buffer.from(signatureHeader, "hex");
  } catch {
    return false;
  }

  if (digest.length !== signature.length) return false;
  return timingSafeEqual(digest, signature);
}

export async function POST(request: Request) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-signature");

  if (!isValidSignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const meta = (payload.meta ?? {}) as {
    event_name?: string;
    custom_data?: { user_id?: string };
  };

  if (meta.event_name !== "order_created") {
    return NextResponse.json({ received: true });
  }

  const order = (payload.data ?? {}) as {
    id?: string | number;
    attributes?: {
      user_email?: string;
      first_order_item?: { variant_id?: string | number };
    };
  };

  const attributes = order.attributes ?? {};
  const orderId = order.id !== undefined ? String(order.id) : undefined;
  const customUserId = meta.custom_data?.user_id;
  const customerEmail = attributes.user_email;
  const variantId =
    attributes.first_order_item?.variant_id !== undefined
      ? String(attributes.first_order_item.variant_id)
      : undefined;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  const admin = createAdminClient();

  let userId = customUserId;

  if (!userId) {
    if (!customerEmail) {
      return NextResponse.json({ error: "No user identifier in payload." }, { status: 400 });
    }

    const { data: matchedUser } = await admin
      .from("users")
      .select("id")
      .eq("email", customerEmail)
      .single();

    userId = matchedUser?.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "No matching user for this order." }, { status: 404 });
  }

  const credits = (variantId && CREDIT_PACKAGES[variantId]) ?? DEFAULT_CREDITS;

  const { data: credited, error } = await admin.rpc("add_credits_for_order", {
    p_user_id: userId,
    p_order_id: orderId,
    p_amount: credits,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to credit account." }, { status: 500 });
  }

  return NextResponse.json({ received: true, credited: Boolean(credited) });
}
