export type BriefSection = {
  title: string;
  body: string[];
};

export type SpyBrief = {
  brandName: string;
  target: string;
  generatedAt: string;
  sections: BriefSection[];
};

export const BRIEF_SECTION_TITLES = [
  "Positioning & Brand Narrative",
  "Ad Creative Breakdown",
  "Messaging Angles, Ranked by Frequency",
  "Funnel & Offer Teardown",
  "Recommended Strategy",
] as const;

export function extractBrandName(target: string): string {
  const trimmed = target.trim();

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "");
    if (host.includes(".")) {
      const label = host.split(".")[0];
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
  } catch {
    // Not a URL — fall through and use the raw input as the brand name.
  }

  return trimmed;
}

export function buildSpyBriefMeta(target: string): Omit<SpyBrief, "sections"> {
  return {
    brandName: extractBrandName(target),
    target,
    generatedAt: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

// Fallback content used when the AI call fails or is unavailable — keeps the
// feature working (and credit-worthy) even if Anthropic is down or unfunded.
export function templateSections(brandName: string): BriefSection[] {
  return [
    {
      title: "Positioning & Brand Narrative",
      body: [
        `${brandName} positions itself around a core promise rather than a feature list — the brand narrative leads with outcome, not product.`,
        "Expect a founder-led or mission-led story arc in top-funnel creative, reserving specs and pricing for mid-to-bottom funnel assets.",
        "Visual identity favors a small, consistent color palette and a single recognizable typographic voice across every touchpoint.",
      ],
    },
    {
      title: "Ad Creative Breakdown",
      body: [
        "UGC-style video (0:15–0:30) leading with a relatable problem, cutting to product-in-use within the first 3 seconds.",
        "Static carousel ads pairing a bold claim headline with a proof point — a review, a stat, or a before/after — on each frame.",
        "Founder-to-camera or authority testimonial format used to build trust ahead of a retargeting offer.",
      ],
    },
    {
      title: "Messaging Angles, Ranked by Frequency",
      body: [
        "1. Social proof — reviews, ratings, and \"as seen in\" placements.",
        "2. Problem–agitate–solve — naming the pain point before introducing the product as relief.",
        "3. Urgency and scarcity — limited restock, time-boxed discount, or waitlist framing.",
        "4. Comparison — implicit or explicit contrast against the category default or DIY alternative.",
      ],
    },
    {
      title: "Funnel & Offer Teardown",
      body: [
        "Landing pages are single-offer, single-CTA, with objection-handling FAQ placed just above the fold.",
        "Primary offer mechanic is a bundle discount or a free-shipping threshold rather than a blanket percentage off.",
        "Post-purchase upsell or subscription option is introduced after checkout intent, not before.",
      ],
    },
    {
      title: "Recommended Strategy",
      body: [
        `Open your pitch by naming the angle ${brandName} has not claimed yet — the gap is the opening.`,
        "Lead your first test round with a UGC-style hook plus a comparison angle; both are cheap to produce and fast to read.",
        "Match their offer structure only where it lowers risk for the buyer, and differentiate everywhere else.",
      ],
    },
  ];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderSpyBriefHtml(brief: SpyBrief): string {
  const pages = brief.sections
    .map((section, index) => {
      const pageNumber = index + 1;
      const isFirst = index === 0;
      const isLast = index === brief.sections.length - 1;

      return `
        <section class="page"${isLast ? "" : ' style="page-break-after: always;"'}>
          <header class="page-header">
            <span class="eyebrow">SpyOutreach · Spy Brief</span>
            <span class="page-number">${pageNumber} / ${brief.sections.length}</span>
          </header>

          ${
            isFirst
              ? `
          <div class="hero">
            <p class="hero-label">Creative Brief &amp; Ad Strategy</p>
            <h1 class="hero-title">${escapeHtml(brief.brandName)}</h1>
            <p class="hero-meta">Prepared ${escapeHtml(brief.generatedAt)}</p>
          </div>
          `
              : ""
          }

          <div class="section">
            <div class="section-heading">
              <span class="section-index">${String(pageNumber).padStart(2, "0")}</span>
              <h2 class="section-title">${escapeHtml(section.title)}</h2>
            </div>
            <div class="section-body">
              ${section.body.map((line) => `<p class="brief-line">${escapeHtml(line)}</p>`).join("\n")}
            </div>
          </div>

          <footer class="page-footer">
            <div class="page-footer-row">
              <span>Prepared by SpyOutreach</span>
              <span>spyoutreach.com</span>
            </div>
            <p class="page-footer-disclaimer">
              AI-assisted analysis based on publicly available information. Reflects general
              strategic patterns, not verified or guaranteed claims about the named brand.
            </p>
          </footer>
        </section>
      `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="color-scheme" content="light only" />
<title>Spy Brief — ${escapeHtml(brief.brandName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    color-scheme: light only;
  }

  html, body {
    background: #ffffff;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #1d1d1f;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    display: flex;
    flex-direction: column;
    min-height: 255mm;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10mm;
    border-bottom: 0.4mm solid #d2d2d7;
  }

  .eyebrow {
    font-size: 9pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #86868b;
  }

  .page-number {
    font-size: 9pt;
    color: #86868b;
  }

  .hero {
    padding: 20mm 0 14mm;
  }

  .hero-label {
    font-size: 11pt;
    color: #635bff;
    font-weight: 600;
    letter-spacing: 0.02em;
    margin-bottom: 4mm;
  }

  .hero-title {
    font-size: 34pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #1d1d1f;
  }

  .hero-meta {
    margin-top: 6mm;
    font-size: 10pt;
    color: #86868b;
  }

  .section {
    flex: 1;
    padding-top: 14mm;
  }

  .section-heading {
    display: flex;
    align-items: baseline;
    gap: 5mm;
    margin-bottom: 8mm;
  }

  .section-index {
    font-size: 10pt;
    font-weight: 700;
    color: #ffffff;
    background: #635bff;
    border-radius: 999px;
    width: 8mm;
    height: 8mm;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .section-title {
    font-size: 20pt;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .section-body {
    max-width: 150mm;
  }

  .brief-line {
    font-size: 11.5pt;
    line-height: 1.7;
    color: #3a3a3d;
    margin-bottom: 5mm;
  }

  .page-footer {
    padding-top: 8mm;
    border-top: 0.4mm solid #d2d2d7;
  }

  .page-footer-row {
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    color: #86868b;
  }

  .page-footer-disclaimer {
    margin-top: 2mm;
    font-size: 7pt;
    line-height: 1.5;
    color: #a1a1a6;
    max-width: 150mm;
  }
</style>
</head>
<body>
${pages}
</body>
</html>`;
}
