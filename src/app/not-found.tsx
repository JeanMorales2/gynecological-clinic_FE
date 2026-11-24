import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center">
      <BrandMark width={160} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Página no encontrada</h1>
        <p className="mt-2 text-text-secondary">La página que buscas no existe o fue movida.</p>
      </div>
      <Link className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg" href="/">
        Ir al inicio
      </Link>
    </div>
  );
}
