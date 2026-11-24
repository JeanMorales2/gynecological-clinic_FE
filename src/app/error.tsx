"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center">
      <BrandMark width={160} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Ocurrió un error inesperado</h1>
        <p className="mt-2 text-text-secondary">Intenta de nuevo. Si el problema sigue, avisa al equipo técnico.</p>
      </div>
      <div className="flex gap-3">
        <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg" onClick={reset} type="button">
          Reintentar
        </button>
        <Link className="inline-flex items-center justify-center rounded-lg border border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg" href="/">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
