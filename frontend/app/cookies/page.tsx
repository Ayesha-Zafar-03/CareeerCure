import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "What are cookies",
    body: "Cookies are small text files stored on your device that help us keep you signed in and remember your preferences while using CareerCure.",
  },
  {
    title: "How we use cookies",
    body: "We use essential cookies for authentication and security, and optional analytics cookies to understand how the platform is used so we can improve it.",
  },
  {
    title: "Managing cookies",
    body: "You can control or delete cookies through your browser settings at any time. Disabling essential cookies may affect your ability to use certain features.",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-primary-dark mb-3">Cookie Policy</h1>
        <p className="text-ink/60 mb-10">
          This policy explains how and why CareerCure uses cookies.
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
