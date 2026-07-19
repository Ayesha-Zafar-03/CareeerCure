"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-3xl text-primary-dark mb-3">
          Something went wrong
        </h1>
        <p className="text-ink/60 mb-8 font-light">
          An unexpected error occurred. You can try again or head back home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="font-mono text-[11px] tracking-[0.1em] uppercase px-5 py-2.5 bg-primary text-white hover:bg-primary/85 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-mono text-[11px] tracking-[0.1em] uppercase px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
