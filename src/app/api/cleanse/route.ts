import { NextResponse } from "next/server";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const LEGAL_SUFFIXES = ["ltd", "şti", "sti", "inc", "llc", "co", "gmbh"];
const SUFFIX_RE = new RegExp(`[,\\s]+(?:${LEGAL_SUFFIXES.join("|")})\\.?$`, "i");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMPANY_KEYS = ["company", "company_name", "companyname", "organization", "org", "business", "name"];
const EMAIL_KEYS = ["email", "e-mail", "mail"];

function findKey(row: Record<string, unknown>, candidates: string[]): string | null {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const match = keys.find((key) => key.trim().toLowerCase() === candidate);
    if (match) return match;
  }
  return null;
}

function cleanCompanyName(raw: string): string {
  let name = raw.trim();
  let previous: string;
  do {
    previous = name;
    name = name.replace(SUFFIX_RE, "").trim();
  } while (name !== previous && name.length > 0);
  return name.replace(/[,\s]+$/, "").trim();
}

function parseInput(filename: string, text: string): Record<string, unknown>[] {
  if (filename.toLowerCase().endsWith(".json")) {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      throw new Error("JSON file must contain an array of lead objects.");
    }
    return data as Record<string, unknown>[];
  }

  const { data, errors } = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return data;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!/\.(csv|json)$/i.test(file.name)) {
    return NextResponse.json({ error: "Only .csv or .json files are supported." }, { status: 400 });
  }

  let rows: Record<string, unknown>[];
  try {
    const text = await file.text();
    rows = parseInput(file.name, text);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse file." },
      { status: 400 },
    );
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "File contains no rows." }, { status: 400 });
  }

  const companyKey = findKey(rows[0], COMPANY_KEYS);
  const emailKey = findKey(rows[0], EMAIL_KEYS);

  const cleaned = rows.map((row) => {
    const output: Record<string, unknown> = { ...row };

    if (companyKey && typeof row[companyKey] === "string") {
      output[companyKey] = cleanCompanyName(row[companyKey] as string);
    }

    if (emailKey) {
      const email = typeof row[emailKey] === "string" ? (row[emailKey] as string).trim() : "";
      output.email_valid = EMAIL_RE.test(email);
    }

    return output;
  });

  const admin = createAdminClient();
  const { data: deducted, error: deductError } = await admin.rpc("deduct_credit", {
    p_user_id: user.id,
    p_amount: 1,
  });

  if (deductError || !deducted) {
    return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
  }

  const { data: profile } = await admin.from("users").select("credits").eq("id", user.id).single();

  await admin.from("leads_batches").insert({
    user_id: user.id,
    original_filename: file.name,
    status: "completed",
    total_leads: rows.length,
    cleaned_leads: cleaned.length,
    credits_used: 1,
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json({
    filename: `cleaned-${file.name.replace(/\.[^.]+$/, "")}.csv`,
    csv: Papa.unparse(cleaned),
    totalLeads: rows.length,
    credits: profile?.credits ?? 0,
  });
}
