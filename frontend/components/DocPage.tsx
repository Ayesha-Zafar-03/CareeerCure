import Link from "next/link";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";

export type DocSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function DocPage({
  breadcrumb,
  title,
  description,
  updated,
  sections,
}: {
  breadcrumb: string;
  title: string;
  description: string;
  updated?: string;
  sections: DocSection[];
}) {
  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader />

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        <nav className="text-xs text-ink/40 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-ink/60">{breadcrumb}</span>
        </nav>

        <header className="border-b border-line pb-8 mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-dark mb-3">
            {title}
          </h1>
          <p className="text-lg text-ink/60 max-w-2xl">{description}</p>
          {updated && (
            <p className="text-sm text-ink/40 mt-4">Last updated: {updated}</p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          {/* Table of contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/40 mb-3">
                On this page
              </p>
              <ul className="space-y-2 border-l border-line">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block pl-4 -ml-px border-l border-transparent text-sm text-ink/60 hover:text-primary hover:border-primary transition-colors"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <article className="space-y-10 max-w-2xl">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-primary-dark mb-3">
                  {s.title}
                </h2>
                <div className="text-ink/70 leading-relaxed text-[15px]">
                  {s.content}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
