import DocPage from "@/components/DocPage";

export default function PrivacyPage() {
  return (
    <DocPage
      breadcrumb="Privacy Policy"
      title="Privacy Policy"
      description="This policy explains what information CareerCure collects, how we use it, and the choices you have over your data."
      updated="August 2026"
      sections={[
        {
          id: "overview",
          title: "Overview",
          content: (
            <p>
              CareerCure ("we", "us") is committed to protecting your privacy. This
              policy applies to the CareerCure web application and describes our
              practices for handling personal information of students and graduates
              who use the platform.
            </p>
          ),
        },
        {
          id: "collection",
          title: "Information we collect",
          content: (
            <p>
              We collect information you provide directly, such as your name, email
              address, and the CV you upload. We also collect limited usage data
              (such as feature interactions) needed to operate and improve the
              service. We do not collect special-category sensitive data unless you
              choose to include it in your CV.
            </p>
          ),
        },
        {
          id: "use",
          title: "How we use your information",
          content: (
            <p>
              Your information is used to create your account, power CV analysis,
              generate roadmaps, match internships and courses, and respond to
              support requests. Aggregated, de-identified data may be used to
              improve our models and product experience.
            </p>
          ),
        },
        {
          id: "sharing",
          title: "Sharing and disclosure",
          content: (
            <p>
              We do not sell your personal data. We may share data with trusted
              service providers (for example, email delivery and hosting) strictly
              to operate the platform, and where required by law.
            </p>
          ),
        },
        {
          id: "retention",
          title: "Data retention",
          content: (
            <p>
              We retain your account and CV data for as long as your account is
              active. You may delete your account at any time, after which we
              remove your personal data within a reasonable period.
            </p>
          ),
        },
        {
          id: "rights",
          title: "Your rights",
          content: (
            <p>
              You may access, correct, or delete your personal information, and you
              can object to certain processing. To exercise these rights, contact
              our team via the{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>
              .
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          content: (
            <p>
              Questions about this policy can be sent to the team using the email
              addresses listed on our{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
