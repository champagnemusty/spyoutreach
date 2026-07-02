import type { Browser } from "puppeteer-core";

const LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox"];

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    const { default: chromium } = await import("@sparticuz/chromium");
    const { default: puppeteerCore } = await import("puppeteer-core");

    return puppeteerCore.launch({
      args: [...chromium.args, ...LAUNCH_ARGS],
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { default: puppeteer } = await import("puppeteer");
  return puppeteer.launch({
    headless: true,
    args: LAUNCH_ARGS,
  }) as unknown as Browser;
}
