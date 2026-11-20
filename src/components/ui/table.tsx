import type { ReactNode } from "react";

export type TableColumn<T> = {
  key: keyof T;
  header: ReactNode;
  render?: (row: T) => ReactNode;
};

export type TablePagination = {
  summary: string;
  currentPage: number;
  totalPages: number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
};

export type TableProps<T extends { id: string | number }> = {
  columns: TableColumn<T>[];
  data: T[];
  caption?: string;
  pagination?: TablePagination;
  emptyMessage?: string;
};

export function Table<T extends { id: string | number }>({
  caption,
  columns,
  data,
  emptyMessage = "No hay datos para mostrar.",
  pagination,
}: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-bg">
            <tr>{columns.map((column) => <th className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-text-secondary" key={String(column.key)} scope="col">{column.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? data.map((row) => (
              <tr className="transition-colors hover:bg-bg" key={row.id}>
                {columns.map((column) => <td className="whitespace-nowrap px-5 py-4 text-sm text-text" key={String(column.key)}>{column.render ? column.render(row) : String(row[column.key] ?? "")}</td>)}
              </tr>
            )) : <tr><td className="px-5 py-8 text-center text-sm text-text-secondary" colSpan={columns.length}>{emptyMessage}</td></tr>}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-text-secondary">{pagination.summary}</span>
          <div aria-label="Paginación" className="flex items-center gap-2">
            <button aria-label="Página anterior" className="rounded-md border border-border px-3 py-1.5 text-text-secondary disabled:cursor-not-allowed disabled:opacity-50" disabled={pagination.currentPage === 1} onClick={pagination.onPreviousPage} type="button">Anterior</button>
            <span className="text-text">Página {pagination.currentPage} de {pagination.totalPages}</span>
            <button aria-label="Página siguiente" className="rounded-md border border-border px-3 py-1.5 text-text-secondary disabled:cursor-not-allowed disabled:opacity-50" disabled={pagination.currentPage === pagination.totalPages} onClick={pagination.onNextPage} type="button">Siguiente</button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
