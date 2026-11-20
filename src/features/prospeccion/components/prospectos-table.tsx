"use client";

import { Badge, Button, Icon, Table, type BadgeTone, type IconName, type TableColumn } from "@/components/ui";
import type { Prospect, ProspectStatus } from "../api";

type ProspectosTableProps = {
  prospects: Prospect[];
  totalCount: number;
  page: number;
  pageSize: number;
  onEdit: (prospect: Prospect) => void;
  onConvert: (prospect: Prospect) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const statusPresentation: Record<ProspectStatus, { tone: BadgeTone; icon: IconName }> = {
  Nuevo: { tone: "info", icon: "info" },
  Contactado: { tone: "warning", icon: "clock" },
  Agendado: { tone: "accent", icon: "calendar" },
  Convertido: { tone: "success", icon: "check" },
  Perdido: { tone: "neutral", icon: "circle" },
};

export function ProspectosTable({ onConvert, onEdit, onNextPage, onPreviousPage, page, pageSize, prospects, totalCount }: ProspectosTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const columns: TableColumn<Prospect>[] = [
    { key: "nombreCompleto", header: "Nombre" },
    { key: "telefono", header: "Teléfono" },
    { key: "fuente", header: "Fuente", render: (prospect) => prospect.fuente ?? <span className="text-text-secondary">Sin especificar</span> },
    {
      key: "estado",
      header: "Estado",
      render: (prospect) => {
        const presentation = statusPresentation[prospect.estado];
        return <Badge icon={<Icon name={presentation.icon} size={16} />} tone={presentation.tone}>{prospect.estado}</Badge>;
      },
    },
    {
      key: "id",
      header: "Acciones",
      render: (prospect) => (
        <div className="flex items-center gap-2">
          <Button aria-label={`Editar a ${prospect.nombreCompleto}`} disabled={prospect.estado === "Convertido"} onClick={() => onEdit(prospect)} size="sm" variant="ghost">Editar</Button>
          {prospect.estado !== "Convertido" ? <Button aria-label={`Convertir a ${prospect.nombreCompleto} en paciente`} onClick={() => onConvert(prospect)} size="sm" variant="outline">Convertir a paciente</Button> : null}
        </div>
      ),
    },
  ];

  return <Table
    caption="Prospectos"
    columns={columns}
    data={prospects}
    emptyMessage="Todavía no hay prospectos registrados."
    pagination={{
      currentPage: page,
      onNextPage,
      onPreviousPage,
      summary: `Mostrando ${start}–${end} de ${totalCount} prospectos`,
      totalPages,
    }}
  />;
}
