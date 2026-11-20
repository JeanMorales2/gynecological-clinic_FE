"use client";

import { Badge, Button, Icon, Table, type TableColumn } from "@/components/ui";
import type { StaffUser } from "../api";

type UsuariosTableProps = {
  users: StaffUser[];
  isUpdatingId: string | null;
  onEdit: (user: StaffUser) => void;
  onDeactivate: (user: StaffUser) => void;
};

const roleLabels: Record<StaffUser["role"], string> = {
  Admin: "Administrador",
  Recepcionista: "Recepcionista",
  Ginecologa: "Ginecóloga",
};

export function UsuariosTable({ isUpdatingId, onDeactivate, onEdit, users }: UsuariosTableProps) {
  const columns: TableColumn<StaffUser>[] = [
    { key: "nombreCompleto", header: "Nombre" },
    { key: "telefono", header: "Teléfono", render: (user) => user.telefono || "Sin teléfono" },
    { key: "role", header: "Rol", render: (user) => roleLabels[user.role] },
    {
      key: "activo",
      header: "Estado",
      render: (user) => (
        <Badge icon={<Icon name={user.activo ? "check" : "circle"} size={16} />} tone={user.activo ? "success" : "neutral"}>
          {user.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "id",
      header: "Acciones",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button aria-label={`Editar a ${user.nombreCompleto}`} disabled={isUpdatingId === user.id} onClick={() => onEdit(user)} size="sm" variant="ghost">Editar</Button>
          {user.activo ? <Button aria-label={`Desactivar a ${user.nombreCompleto}`} disabled={isUpdatingId === user.id} onClick={() => onDeactivate(user)} size="sm" variant="ghost">Desactivar</Button> : null}
        </div>
      ),
    },
  ];

  return <Table caption="Usuarios y roles" columns={columns} data={users} emptyMessage="Todavía no hay usuarios registrados." />;
}
