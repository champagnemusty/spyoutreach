import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" updatedAt="July 8, 2026">
      <section>
        <h2 className="text-base font-medium text-foreground">1. Acceptance of terms</h2>
        <p className="mt-2">
          By creating an account or using SpyOutreach (&quot;the Service&quot;), you agree to
          these Terms of Service. If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">2. The Service</h2>
        <p className="mt-2">
          SpyOutreach provides two tools: a Lead Cleanser that normalizes and validates B2B
          contact lists, and a Spy Brief Generator that produces a PDF ad-strategy brief for a
          named competitor. The Service is credit-based — there is no subscription. Each account
          receives 3 free credits on sign-up, and additional credits can be purchased in
          packages that do not expire.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">3. Accounts</h2>
        <p className="mt-2">
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity under your account. You must provide a valid email address to sign up.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">4. Payments</h2>
        <p className="mt-2">
          Credit purchases are processed by Lemon Squeezy, our payment processor and Merchant of
          Record. Lemon Squeezy handles payment collection, sales tax/VAT, and receipts for your
          purchase. Credits are added to your account automatically after a successful payment.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">5. Acceptable use</h2>
        <p className="mt-2">
          You agree not to use the Service to upload data you do not have the right to use, to
          harass or spam third parties, or to attempt to disrupt, reverse-engineer, or overload
          the Service. We may suspend accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">6. Intellectual property</h2>
        <p className="mt-2">
          Reports and cleaned data files generated for your account are yours to use. The
          underlying Service, software, and branding remain the property of SpyOutreach.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">7. Disclaimer</h2>
        <p className="mt-2">
          The Service, including Spy Brief content, is provided for informational purposes and
          reflects general strategic patterns rather than a guarantee of accuracy about any named
          competitor. The Service is provided &quot;as is&quot; without warranties of any kind.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">8. Limitation of liability</h2>
        <p className="mt-2">
          To the maximum extent permitted by law, SpyOutreach is not liable for any indirect,
          incidental, or consequential damages arising from your use of the Service.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">9. Termination</h2>
        <p className="mt-2">
          You may stop using the Service at any time. We may suspend or terminate accounts that
          violate these terms. Unused credits at the time of a violation-based termination are
          forfeited.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">10. Contact</h2>
        <p className="mt-2">
          Questions about these terms? Email{" "}
          <a href="mailto:mustafaemirnus@gmail.com" className="text-accent">
            mustafaemirnus@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
