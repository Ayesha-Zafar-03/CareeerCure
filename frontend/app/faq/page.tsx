import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";

const FAQS = [
  {
    q: "Is CareerCure free to use?",
    a: "Yes. CareerCure is completely free for students and fresh graduates — no credit card required.",
  },
  {
    q: "How does the CV analysis work?",
    a: "Upload your CV and our AI extracts your skills, identifies gaps, and suggests concrete improvements to make you stand out.",
  },
  {
    q: "What is a career roadmap?",
    a: "It's a personalised, step-by-step learning path generated from your skills and career goal, so you always know what to do next.",
  },
  {
    q: "How are internships matched?",
    a: "We use semantic matching against your CV profile and rank internships by how well they fit you, powered by ChromaDB.",
  },
  {
    q: "Where do the course recommendations come from?",
    a: "Courses are curated from top platforms including Udemy, Coursera, and edX, chosen to fill your specific skill gaps.",
  },
  {
    q: "Do I need a CV to get started?",
    a: "No. If you don't have a CV yet, you can use our CV wizard to generate one from scratch.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-primary-dark mb-3">Frequently asked questions</h1>
        <p className="text-ink/60 mb-10">
          Everything you need to know about using CareerCure to launch your career.
        </p>
        <div className="space-y-4">
          {FAQS.map((item) => (
            <div key={item.q} className="bg-surface rounded-xl border border-line p-6 shadow-sm">
              <h2 className="font-semibold text-primary-dark mb-2">{item.q}</h2>
              <p className="text-sm text-ink/70 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
