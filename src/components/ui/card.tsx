import type { ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Card({ children, title, action, className = "", contentClassName = "" }: CardProps) {
  const hasHeader = title || action;

  return (
    <section className={`overflow-hidden rounded-xl border border-border bg-surface ${className}`}>
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