"use client";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Contact", href: "/#contact" },
];

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-line/50 px-6 py-4 backdrop-blur-sm bg-surface/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="CareerCure" className="h-9 w-auto bg-transparent" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-ink/60 hover:text-primary font-medium transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm text-ink/60 hover:text-primary font-medium transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-primary hover:bg-primary-d text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Get Started Free
          </Link>
          <button
            className="md:hidden p-2 rounded-lg text-ink/60 hover:bg-primary/5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-line/50 mt-3 py-3 px-2 space-y-1 animate-fade-in">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/70 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/70 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
