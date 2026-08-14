import DocPage from "@/components/DocPage";

export default function FaqPage() {
  return (
    <DocPage
      breadcrumb="FAQ"
      title="Frequently asked questions"
      description="Answers to the most common questions about CareerCure, from getting started to how our AI features work."
      updated="August 2026"
      sections={[
        {
          id: "getting-started",
          title: "How do I get started?",
          content: (
            <p>
              Create a free account, upload your CV (or build one with our wizard),
              and CareerCure will generate a personalised career roadmap, suggest
              relevant internships, and recommend courses tailored to your goals.
            </p>
          ),
        },
        {
          id: "pricing",
          title: "Is CareerCure free?",
          content: (
            <p>
              Yes. CareerCure is free for students and fresh graduates. There is no
              credit card required and no paywalled core features.
            </p>
          ),
        },
        {
          id: "cv-analysis",
          title: "How does CV analysis work?",
          content: (
            <p>
              Our AI reads your CV to extract your skills, identify gaps relative to
              your target role, and give you concrete, actionable improvements. The
              analysis is private and used only to power your recommendations.
            </p>
          ),
        },
        {
          id: "matching",
          title: "How are internships and courses matched?",
          content: (
            <p>
              Internships are matched semantically against your CV profile using
              ChromaDB and ranked by fit. Courses are pulled from Udemy, Coursera,
              and edX and chosen to close the specific skill gaps we detect.
            </p>
          ),
        },
        {
          id: "roadmap",
          title: "What is a career roadmap?",
          content: (
            <p>
              A roadmap is a step-by-step learning path built from your current
              skills and career goal. It tells you what to learn next and in what
              order, so you always know your next move.
            </p>
          ),
        },
        {
          id: "data",
          title: "Is my data secure?",
          content: (
            <p>
              Your CV and account data are processed securely and are never sold.
              You can request deletion of your data at any time by contacting our
              team via the addresses on our{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>
              .
            </p>
          ),
        },
        {
          id: "support",
          title: "How do I get help?",
          content: (
            <p>
              You can chat with the AI Career Coach inside the app, or email the
              team directly from our{" "}
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
