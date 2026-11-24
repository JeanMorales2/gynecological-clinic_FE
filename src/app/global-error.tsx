"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">Ocurrió un error inesperado</h1>
            <p className="mt-2 text-text-secondary">Intenta de nuevo. Si el problema sigue, avisa al equipo técnico.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg" onClick={reset} type="button">
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
