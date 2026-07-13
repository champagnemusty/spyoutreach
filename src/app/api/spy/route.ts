import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { launchBrowser } from "@/lib/browser";
import { buildSpyBriefMeta, renderSpyBriefHtml, type SpyBrief } from "@/lib/reports/spy-brief";
import { resolveBriefSections } from "@/lib/reports/ai-brief";

export const runtime = "nodejs";
export const maxDuration = 60;

const URL_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/i;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let target = "";
  try {
    const body = await request.json();
    target = String(body?.target ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!target) {
    return NextResponse.json(
      { error: "A competitor brand name or URL is required." },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
  }

  const meta = buildSpyBriefMeta(target);

  const browser = await launchBrowser();
  let pdfBuffer: Buffer;
  try {
    const sections = await resolveBriefSections(browser, target, meta.brandName);
    const brief: SpyBrief = { ...meta, sections };
    const html = renderSpyBriefHtml(brief);

    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.setContent(html);
    pdfBuffer = Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
      }),
    );
  } finally {
    await browser.close();
  }

  const admin = createAdminClient();
  const { data: deducted, error: deductError } = await admin.rpc("deduct_credit", {
    p_user_id: user.id,
    p_amount: 1,
  });

  if (deductError || !deducted) {
    return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
  }

  const { data: updatedProfile } = await admin
    .from("users")
    .select("credits")
    .eq("id", user.id)
    .single();

  await admin.from("pdf_reports").insert({
    user_id: user.id,
    brand_name: meta.brandName,
    brand_url: URL_RE.test(target) ? target : null,
    status: "completed",
    credits_used: 1,
    completed_at: new Date().toISOString(),
  });

  const filename = `spy-brief-${meta.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;

  return NextResponse.json({
    filename,
    pdfBase64: pdfBuffer.toString("base64"),
    credits: updatedProfile?.credits ?? 0,
  });
}
