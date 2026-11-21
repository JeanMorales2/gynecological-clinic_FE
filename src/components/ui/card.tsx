import type { ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Deja overflow visible: necesario cuando el contenido abre un dropdown/overlay que debe sobresalir de la tarjeta (p. ej. un buscador con sugerencias). */
  allowOverflow?: boolean;
};

export function Card({ children, title, action, className = "", contentClassName = "", allowOverflow = false }: CardProps) {
  const hasHeader = title || action;

  return (
    <section className={`${allowOverflow ? "overflow-visible" : "overflow-hidden"} rounded-xl border border-border bg-surface ${className}`}>
      {hasHeader ? (
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          {title ? <h2 className="text-lg font-semibold text-text">{title}</h2> : <span />}
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={`p-5 ${contentClassName}`}>{children}</div>
    </section>
  );
}