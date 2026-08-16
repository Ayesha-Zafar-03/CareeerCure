import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";
import { MailIcon, MapPinIcon } from "lucide-react";

const CONTACTS = [
  {
    name: "Ayesha Zafar",
    role: "Co-Founder",
    email: "ayeshaaazafar2004@gmail.com",
  },
  {
    name: "Eman Abdul Khaliq",
    role: "Co-Founder",
    email: "Emanabdulkhaliq52@gmail.com",
  },
  {
    name: "Hira Jawaid",
    role: "Co-Founder",
    email: "hira.jawaidd@gmail.com",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader />

      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-20">
        <nav className="text-xs text-ink/40 mb-6 flex items-center gap-1.5">
          <a href="/" className="hover:text-primary transition-colors">
            Home
          </a>
          <span>/</span>
          <span className="text-ink/60">Contact</span>
        </nav>

        <header className="border-b border-line pb-8 mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-dark mb-3">
            Contact us
          </h1>
          <p className="text-lg text-ink/60 max-w-2xl">
            Have a question about CareerCure, your account, or a partnership? Reach
            out to the team directly and we'll get back to you.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CONTACTS.map((c) => (
            <a
              key={c.email}
              href={`mailto:${c.email}`}
              className="group bg-surface border border-line rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold mb-4">
                {c.name.charAt(0)}
              </div>
              <h2 className="font-semibold text-primary-dark">{c.name}</h2>
              <p className="text-sm text-ink/50 mb-4">{c.role}</p>
              <span className="inline-flex items-center gap-2 text-sm text-primary group-hover:underline">
                <MailIcon className="w-4 h-4" />
                {c.email}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-10 flex items-start gap-3 text-sm text-ink/60 bg-primary/5 border border-primary/10 rounded-xl p-5">
          <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p>
            CareerCure is a student career-development platform. For general
            enquiries, email any member of the team above and we'll respond as soon
            as possible.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
