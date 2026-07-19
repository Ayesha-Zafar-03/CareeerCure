import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-3">
          404
        </p>
        <h1 className="font-serif text-3xl text-primary-dark mb-3">Page not found</h1>
        <p className="text-ink/60 mb-8 font-light">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-block font-mono text-[11px] tracking-[0.1em] uppercase px-5 py-2.5 bg-primary text-white hover:bg-primary/85 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
