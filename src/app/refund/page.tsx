import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function RefundPage() {
  return (
    <LegalPageLayout title="Refund Policy" updatedAt="July 8, 2026">
      <section>
        <h2 className="text-base font-medium text-foreground">Credits, not subscriptions</h2>
        <p className="mt-2">
          SpyOutreach sells prepaid credit packages, not subscriptions. There is nothing to
          cancel — credits never expire and are only consumed when you run a Lead Cleanser batch
          or generate a Spy Brief report.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">Unused credits</h2>
        <p className="mt-2">
          If you purchased credits and haven&apos;t used any of them, email us within 14 days of
          purchase and we&apos;ll issue a full refund.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">Used credits</h2>
        <p className="mt-2">
          Credits already spent on a completed Lead Cleanser batch or a delivered Spy Brief PDF
          are non-refundable, since the underlying processing has already been performed.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">Technical failures</h2>
        <p className="mt-2">
          If a credit was deducted but you did not receive a working file or report due to a fault
          on our end, email us with your account email and approximate time of the issue — we will
          refund the credit to your balance.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">How to request a refund</h2>
        <p className="mt-2">
          Email{" "}
          <a href="mailto:mustafaemirnus@gmail.com" className="text-accent">
            mustafaemirnus@gmail.com
          </a>{" "}
          with your account email. Payments are processed by Lemon Squeezy, our Merchant of
          Record, and refunds are issued back to your original payment method through them.
        </p>
      </section>
    </LegalPageLayout>
  );
}
