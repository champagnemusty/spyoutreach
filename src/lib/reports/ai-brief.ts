import type { Browser } from "puppeteer-core";
import Anthropic from "@anthropic-ai/sdk";
import { BRIEF_SECTION_TITLES, templateSections, type BriefSection } from "./spy-brief";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_SITE_TEXT_LENGTH = 4000;
const AI_TIMEOUT_MS = 20000;

// The model occasionally ignores the array type and returns a single string
// containing bracketed, newline-separated pseudo-list items instead. Recover
// the individual lines rather than discarding an otherwise-usable response.
function coerceToLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((line): line is string => typeof line === "string");
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim().replace(/^\[?"(.*)"\]?$/, "$1"))
      .filter((line) => line.length > 0);
  }

  return [];
}

export function normalizeUrl(target: string): string | null {
  const trimmed = target.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function scrapeWebsiteText(browser: Browser, url: string): Promise<string | null> {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
    const text = await page.evaluate(() => document.body?.innerText ?? "");
    const cleaned = text.replace(/\s+/g, " ").trim();
    return cleaned.length > 0 ? cleaned.slice(0, MAX_SITE_TEXT_LENGTH) : null;
  } catch {
    return null;
  } finally {
    await page.close();
  }
}

// Fixed keys mapped 1:1 to BRIEF_SECTION_TITLES, in order. The model fills in
// bullet content only — it never chooses titles, so the output always has
// exactly the five sections the PDF template expects.
const SECTION_KEYS = [
  "positioning_and_brand_narrative",
  "ad_creative_breakdown",
  "messaging_angles_ranked_by_frequency",
  "funnel_and_offer_teardown",
  "recommended_strategy",
] as const;

const briefTool: Anthropic.Tool = {
  name: "generate_spy_brief",
  description: "Generate the body content for the five fixed sections of a competitor ad-strategy brief.",
  input_schema: {
    type: "object",
    properties: Object.fromEntries(
      SECTION_KEYS.map((key) => [
        key,
        {
          type: "array",
          items: { type: "string" },
          description: "3-4 concise, specific bullet-style lines (no markdown bullets).",
        },
      ]),
    ),
    required: [...SECTION_KEYS],
  },
};

export async function generateAiSections(
  brandName: string,
  websiteText: string | null,
): Promise<BriefSection[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const anthropic = new Anthropic({ apiKey });

    const context = websiteText
      ? `Here is text scraped from ${brandName}'s website — ground your analysis in it where relevant:\n\n"""${websiteText}"""`
      : `No website content is available for ${brandName}. If you don't have specific, reliable knowledge of this brand, clearly write generalized best-practice guidance for their apparent category instead of inventing specific facts about them.`;

    // Belt-and-suspenders: the SDK's own `timeout` option can behave as an
    // idle timeout rather than a hard wall-clock cap, so race it against a
    // real timer too — this request must never be the reason the whole PDF
    // generation blows past Vercel's function time budget.
    const wallClockTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI brief generation timed out")), AI_TIMEOUT_MS);
    });

    const message = await Promise.race([
      anthropic.messages.create(
        {
          model: MODEL,
          max_tokens: 1500,
          tools: [briefTool],
          tool_choice: { type: "tool", name: "generate_spy_brief" },
          messages: [
            {
              role: "user",
              content: `You are a senior paid-ads strategist writing a competitor "spy brief" for an agency pitching against ${brandName}.

${context}

Fill in 3-4 concise, specific, non-generic lines for each of the five fixed sections: ${BRIEF_SECTION_TITLES.join(", ")}. Each line must be a separate array item — never combine multiple lines into one string.

Be honest and grounded — do not fabricate specific claims (numbers, campaign names, quotes) you cannot support from the provided context. When context is thin, favor clearly-labeled general strategic patterns over invented specifics.`,
            },
          ],
        },
        { timeout: AI_TIMEOUT_MS },
      ),
      wallClockTimeout,
    ]);

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolUse) return null;

    const input = toolUse.input as Record<string, unknown>;

    const sections: BriefSection[] = SECTION_KEYS.map((key, index) => ({
      title: BRIEF_SECTION_TITLES[index],
      body: coerceToLines(input[key]),
    }));

    const valid = sections.every((section) => section.body.length > 0);

    return valid ? sections : null;
  } catch (error) {
    console.error("[ai-brief] Anthropic call failed, falling back to template:", error);
    return null;
  }
}

export async function resolveBriefSections(
  browser: Browser,
  target: string,
  brandName: string,
): Promise<BriefSection[]> {
  const url = normalizeUrl(target);
  const websiteText = url ? await scrapeWebsiteText(browser, url) : null;
  const aiSections = await generateAiSections(brandName, websiteText);
  return aiSections ?? templateSections(brandName);
}
