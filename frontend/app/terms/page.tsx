import DocPage from "@/components/DocPage";

export default function TermsPage() {
  return (
    <DocPage
      breadcrumb="Terms of Service"
      title="Terms of Service"
      description="The following terms govern your use of CareerCure. By using the platform you agree to them."
      updated="August 2026"
      sections={[
        {
          id: "acceptance",
          title: "Acceptance of terms",
          content: (
            <p>
              By accessing or using CareerCure, you agree to be bound by these Terms
              of Service and our Privacy Policy. If you do not agree with any part of
              these terms, you should not use the platform.
            </p>
          ),
        },
        {
          id: "eligibility",
          title: "Eligibility and accounts",
          content: (
            <p>
              You must provide accurate information when creating an account and are
              responsible for keeping your credentials confidential. You are
              accountable for all activity that occurs under your account.
            </p>
          ),
        },
        {
          id: "use",
          title: "Acceptable use",
          content: (
            <p>
              CareerCure is provided for personal career development. You agree not
              to misuse the service, attempt to disrupt it, or use it for any
              unlawful purpose. We may suspend accounts that violate these terms.
            </p>
          ),
        },
        {
          id: "ip",
          title: "Intellectual property",
          content: (
            <p>
              The CareerCure name, branding, and original content are owned by us and
              protected by applicable law. AI-generated guidance is provided for your
              personal use and may not be redistributed commercially without
              permission.
            </p>
          ),
        },
        {
          id: "disclaimers",
          title: "Disclaimers",
          content: (
            <p>
              CareerCure provides guidance for informational purposes. We do not
              guarantee specific outcomes such as job offers, and our suggestions
              should be used alongside your own judgement and research.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Limitation of liability",
          content: (
            <p>
              To the fullest extent permitted by law, CareerCure is not liable for
              any indirect or consequential damages arising from your use of the
              platform.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to these terms",
          content: (
            <p>
              We may update these terms from time to time. Continued use of
              CareerCure after changes are posted constitutes acceptance of the
              updated terms.
            </p>
          ),
        },
      ]}
    />
  );
}
