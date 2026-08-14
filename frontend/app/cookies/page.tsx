import DocPage from "@/components/DocPage";

export default function CookiesPage() {
  return (
    <DocPage
      breadcrumb="Cookie Policy"
      title="Cookie Policy"
      description="This policy explains how CareerCure uses cookies and similar technologies when you use the platform."
      updated="August 2026"
      sections={[
        {
          id: "what",
          title: "What are cookies",
          content: (
            <p>
              Cookies are small text files stored on your device when you visit a
              website. They allow the site to remember your actions and preferences
              over time.
            </p>
          ),
        },
        {
          id: "types",
          title: "Types of cookies we use",
          content: (
            <p>
              We use essential cookies required for authentication and security, and
              optional analytics cookies that help us understand how the platform is
              used so we can improve it. We do not use advertising cookies.
            </p>
          ),
        },
        {
          id: "control",
          title: "Managing cookies",
          content: (
            <p>
              You can control or delete cookies through your browser settings at any
              time. Disabling essential cookies may affect your ability to sign in
              and use certain features.
            </p>
          ),
        },
        {
          id: "more",
          title: "More information",
          content: (
            <p>
              For more detail about how we handle personal data, please see our{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
