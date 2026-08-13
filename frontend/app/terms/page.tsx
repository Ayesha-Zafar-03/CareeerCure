import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "Acceptance of terms",
    body: "By accessing or using CareerCure, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
  },
  {
    title: "Use of the platform",
    body: "CareerCure is provided for personal, non-commercial career development. You are responsible for the accuracy of the information you provide and for keeping your account credentials secure.",
  },
  {
    title: "Intellectual property",
    body: "All content, branding, and AI-generated guidance provided by CareerCure remain the property of CareerCure unless otherwise stated. You may not reproduce or redistribute our content without permission.",
  },
  {
    title: "Limitation of liability",
    body: "CareerCure provides guidance for informational purposes and does not guarantee job offers or specific outcomes. We are not liable for decisions made based on the platform's suggestions.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-primary-dark mb-3">Terms of Service</h1>
        <p className="text-ink/60 mb-10">
          Please read these terms carefully before using CareerCure.
        </p>
        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-primary-dark mb-2">{s.title}</h2>
              <p className="text-sm text-ink/70 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
