"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOutIcon, UserIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cv", label: "CV Analysis" },
  { href: "/internships", label: "Internships" },
  { href: "/courses", label: "Courses" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-surface border-b border-line sticky top-0 z-50 backdrop-blur-sm bg-surface/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <img src="/logo.jpeg" alt="CareerCure" className="h-8 w-auto" />
            <span className="font-mono text-[10px] tracking-wider uppercase text-primary">Admin</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "nav-link px-3 py-2",
                    pathname === link.href && "nav-link-active"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-ink/60">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.full_name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 text-sm text-ink/50 hover:text-accent transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
                <button
                  className="md:hidden p-2 rounded-lg text-ink/60 hover:bg-primary/5"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {user && menuOpen && (
          <div className="md:hidden border-t border-line/50 py-3 space-y-1 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-ink/60 hover:bg-primary/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-line/50">
              <p className="px-3 py-1 text-xs text-ink/50">{user.email}</p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/5 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
