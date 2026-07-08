import { Check, Zap } from "lucide-react";
import { LuxuryCard } from "@/components/ui/luxury-card";

const STORE_URL =
  process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_URL ?? "https://spyoutreach.lemonsqueezy.com";

type Package = {
  name: string;
  variantId: string;
  credits: number;
  price: number;
  highlight?: boolean;
  perks: string[];
};

const PACKAGES: Package[] = [
  {
    name: "Starter",
    variantId: "1883911",
    credits: 20,
    price: 9,
    perks: ["20 credits", "Never expires"],
  },
  {
    name: "Growth",
    variantId: "1883904",
    credits: 60,
    price: 24,
    highlight: true,
    perks: ["60 credits", "Best value per credit", "Never expires"],
  },
  {
    name: "Agency",
    variantId: "1883906",
    credits: 150,
    price: 49,
    perks: ["150 credits", "Lowest cost per credit", "Never expires"],
  },
];

function checkoutUrl(variantId: string, userId: string, email: string) {
  const params = new URLSearchParams({
    "checkout[custom][user_id]": userId,
    "checkout[email]": email,
  });
  return `${STORE_URL}/checkout/buy/${variantId}?${params.toString()}`;
}

export function BuyCreditsTab({ userId, email }: { userId: string; email: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Buy Credits</h2>
        <p className="mt-1 text-sm text-muted">
          Prepaid credits for Lead Cleanser and Spy Brief Generator. Pick a package below.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <LuxuryCard key={pkg.variantId} className="flex flex-col p-6">
            {pkg.highlight && (
              <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-white">
                Most popular
              </span>
            )}

            <h3 className="text-base font-medium text-foreground">{pkg.name}</h3>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                ${pkg.price}
              </span>
              <span className="text-sm text-muted">one-time</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span>{pkg.credits} credits</span>
            </div>

            <ul className="mt-5 flex-1 space-y-2">
              {pkg.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-muted">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <a
              href={checkoutUrl(pkg.variantId, userId, email)}
              className="shimmer-button mt-6 flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              <span className="relative z-10">Buy {pkg.name}</span>
            </a>
          </LuxuryCard>
        ))}
      </div>

      <p className="text-xs text-muted">
        Payments are processed securely by Lemon Squeezy. Credits are added to your account
        automatically after checkout.
      </p>
    </div>
  );
}
