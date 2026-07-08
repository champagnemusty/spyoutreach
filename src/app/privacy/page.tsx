import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updatedAt="July 8, 2026">
      <section>
        <h2 className="text-base font-medium text-foreground">1. What we collect</h2>
        <p className="mt-2">
          We collect your email address and password (encrypted, never stored in plain text) when
          you create an account. When you use the Lead Cleanser, we temporarily process the
          contents of the file you upload. When you use the Spy Brief Generator, we process the
          competitor name or URL you provide.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">2. How we use it</h2>
        <p className="mt-2">
          Your data is used solely to operate the Service: authenticating your account, tracking
          your credit balance, generating the cleaned lead files and PDF briefs you request, and
          crediting your account after a purchase.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">3. Third-party services</h2>
        <p className="mt-2">
          We rely on the following providers to run the Service:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <span className="text-foreground">Supabase</span> — authentication and database
            storage.
          </li>
          <li>
            <span className="text-foreground">Lemon Squeezy</span> — payment processing (Merchant
            of Record).
          </li>
          <li>
            <span className="text-foreground">Vercel</span> — application hosting.
          </li>
        </ul>
        <p className="mt-2">
          Each provider processes data only as needed to deliver their part of the Service.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">4. Data retention</h2>
        <p className="mt-2">
          We keep your account data for as long as your account is active. Uploaded lead files are
          processed and are not retained beyond what is needed to return your cleaned file to you.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">5. Cookies</h2>
        <p className="mt-2">
          We use a single session cookie to keep you signed in. We do not use tracking or
          advertising cookies.
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">6. Your rights</h2>
        <p className="mt-2">
          You can request access to, correction of, or deletion of your account data at any time
          by emailing us. We will act on deletion requests within a reasonable time, subject to
          any records we are legally required to keep (e.g. payment records).
        </p>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">7. Contact</h2>
        <p className="mt-2">
          Questions about this policy? Email{" "}
          <a href="mailto:mustafaemirnus@gmail.com" className="text-accent">
            mustafaemirnus@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
