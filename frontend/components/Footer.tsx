import Link from "next/link";
import {
  BriefcaseIcon,
  FileTextIcon,
  MapIcon,
  BookOpenIcon,
  MessageCircleIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  GithubIcon,
} from "lucide-react";

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "CV Analysis", href: "/cv" },
      { label: "Career Roadmap", href: "/roadmap" },
      { label: "Internships", href: "/internships" },
      { label: "Courses", href: "/courses" },
      { label: "Career Coach", href: "/chat" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "How it Works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "Our Team", href: "/#team" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/#careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: LinkedinIcon },
  { label: "Twitter", href: "https://twitter.com", icon: TwitterIcon },
  { label: "Instagram", href: "https://www.instagram.com", icon: InstagramIcon },
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
];

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo-white.png" alt="CareerCure" className="h-9 w-auto bg-transparent" />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Your AI-powered career companion. Analyse your CV, discover
              internships, and build a personalised roadmap to launch your career.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-accent hover:text-white transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} CareerCure. All rights reserved.
          </p>
          <p className="text-sm text-white/50">
            Made with <span className="text-accent">♥</span> by Ayesha Zafar, Eman & Hira Jawaid
          </p>
        </div>
      </div>
    </footer>
  );
}
