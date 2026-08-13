import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "Information we collect",
    body: "We collect the information you provide when you register (such as your name and email), your uploaded CV, and usage data needed to deliver our AI features. We never sell your personal data.",
  },
  {
    title: "How we use your data",
    body: "Your data is used to provide CV analysis, generate roadmaps, match internships and courses, and improve our platform. Uploaded CVs are processed securely and only used to power the features you choose.",
  },
  {
    title: "Data retention",
    body: "We retain your account data for as long as your account is active. You can request deletion of your data at any time by contacting our team.",
  },
  {
    title: "Your rights",
    body: "You may access, correct, or delete your personal information at any time. For requests, email the team using the contact details on our website.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-primary-dark mb-3">Privacy Policy</h1>
        <p className="text-ink/60 mb-10">
          Your privacy matters to us. This policy explains what we collect and how we use it.
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
