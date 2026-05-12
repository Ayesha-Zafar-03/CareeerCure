"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BriefcaseIcon, LogOutIcon, UserIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cv", label: "CV Tools" },
  { href: "/courses", label: "Courses" },
  { href: "/internships", label: "Internships" },
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">CareerCure</span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.full_name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
                {/* Mobile menu toggle */}
                <button
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
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

        {/* Mobile menu */}
        {user && menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  "block px-3 py-2 rounded-lg text-sm font-medium",
                  pathname === link.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <p className="px-3 py-1 text-xs text-gray-500">{user.email}</p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
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
