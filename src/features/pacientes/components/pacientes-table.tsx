"use client";

import { Badge, Button, Icon, Table, type TableColumn } from "@/components/ui";
import type { Patient } from "../api";

type PacientesTableProps = {
  patients: Patient[];
  totalCount: number;
  page: number;
  pageSize: number;
  isUpdatingId: string | null;
  onEdit: (patient: Patient) => void;
  onDeactivate: (patient: Patient) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const birthDateFormatter = new Intl.DateTimeFormat("es-NI", { dateStyle: "medium" });

function formatBirthDate(value: string) {
  return birthDateFormatter.format(new Date(`${value}T12:00:00`));
}

export function PacientesTable({ isUpdatingId, onDeactivate, onEdit, onNextPage, onPreviousPage, page, pageSize, patients, totalCount }: PacientesTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const columns: TableColumn<Patient>[] = [
    { key: "nombreCompleto", header: "Nombre" },
    { key: "telefono", header: "Teléfono" },
    { key: "fechaNacimiento", header: "Fecha de nacimiento", render: (patient) => formatBirthDate(patient.fechaNacimiento) },
    {
      key: "alergias",
      header: "Alertas",
      render: (patient) => patient.alergias
        ? <Badge icon={<Icon name="alert" size={16} />} tone="danger">Alergias registradas</Badge>
        : <span className="text-text-secondary">Sin alertas</span>,
    },
    {
      key: "activo",
      header: "Estado",
      render: (patient) => (
        <Badge icon={<Icon name={patient.activo ? "check" : "circle"} size={16} />} tone={patient.activo ? "success" : "neutral"}>
          {patient.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "id",
      header: "Acciones",
      render: (patient) => (
        <div className="flex items-center gap-2">
          <Button aria-label={`Editar a ${patient.nombreCompleto}`} disabled={isUpdatingId === patient.id} onClick={() => onEdit(patient)} size="sm" variant="ghost">Editar</Button>
          {patient.activo ? <Button aria-label={`Desactivar a ${patient.nombreCompleto}`} disabled={isUpdatingId === patient.id} onClick={() => onDeactivate(patient)} size="sm" variant="ghost">Desactivar</Button> : null}
        </div>
      ),
    },
  ];

  return <Table
    caption="Pacientes"
    columns={columns}
    data={patients}
    emptyMessage="Todavía no hay pacientes registrados."
    pagination={{
      currentPage: page,
      onNextPage,
      onPreviousPage,
      summary: `Mostrando ${start}–${end} de ${totalCount} pacientes`,
      totalPages,
    }}
  />;
}
