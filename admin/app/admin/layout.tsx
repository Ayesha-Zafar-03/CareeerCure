"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  BookOpenIcon,
  DatabaseIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  ShieldIcon,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpenIcon },
  { href: "/admin/internships", label: "Internships", icon: BriefcaseIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/database", label: "Database", icon: DatabaseIcon },
  { href: "/admin/system", label: "System", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const isActive = (link: typeof NAV[0]) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href);

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-[220px] bg-navy flex flex-col transition-transform duration-200 lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-5 h-14 flex items-center gap-2.5 border-b border-cream/5">
          <img src="/logo.jpeg" alt="CareerCure" className="h-6 w-auto" />
          <span className="font-mono text-[8px] tracking-widest uppercase text-cream/30">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                  active
                    ? "bg-gold/15 text-gold"
                    : "text-cream/40 hover:text-cream/70 hover:bg-cream/5"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-3 border-t border-cream/5">
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
            <div className="w-7 h-7 bg-cream/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-cream text-[10px] font-bold">
                {user.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-cream truncate">{user.full_name}</p>
              <p className="text-[10px] text-cream/30 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cream/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-cream-200 lg:hidden">
          <div className="flex items-center justify-between px-4 h-12">
            <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg text-navy/50 hover:bg-cream-100">
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-navy/40" />
              <span className="font-semibold text-xs text-navy">Admin</span>
            </div>
            <div className="w-8" />
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1200px]">
          {children}
        </main>
      </div>
    </div>
  );
}
