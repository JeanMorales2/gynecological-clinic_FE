import { Table } from "@/components/ui";
import type { PermissionDefinition } from "../api";

type PermissionRow = PermissionDefinition & { id: string };

type PermissionsMatrixProps = {
  permissions: PermissionDefinition[];
  savingKey: string | null;
  onToggle: (permissionKey: string, role: string, value: boolean) => void;
};

function PermissionCheckbox({
  permission,
  role,
  savingKey,
  onToggle,
}: {
  permission: PermissionDefinition;
  role: string;
  savingKey: string | null;
  onToggle: (permissionKey: string, role: string, value: boolean) => void;
}) {
  const checked = permission.rolesConAcceso.includes(role);
  const cellKey = `${permission.key}:${role}`;

  return (
    <input
      aria-label={`${role}: ${permission.descripcion}`}
      checked={checked}
      className="size-4 accent-primary"
      disabled={savingKey === cellKey}
      onChange={(event) => onToggle(permission.key, role, event.target.checked)}
      type="checkbox"
    />
  );
}

export function PermissionsMatrix({
  permissions,
  savingKey,
  onToggle,
}: PermissionsMatrixProps) {
  const rows: PermissionRow[] = permissions.map((permission) => ({
    ...permission,
    id: permission.key,
  }));

  return (
    <Table
      columns={[
        {
          key: "descripcion",
          header: "Permiso",
          render: (permission) => (
            <div className="whitespace-normal">
              <p className="font-medium text-text">{permission.descripcion}</p>
              <p className="mt-1 text-xs text-text-secondary">{permission.key}</p>
            </div>
          ),
        },
        {
          key: "rolesConAcceso",
          header: "Ginecologa",
          render: (permission) => (
            <PermissionCheckbox
              onToggle={onToggle}
              permission={permission}
              role="Ginecologa"
              savingKey={savingKey}
            />
          ),
        },
        {
          key: "id",
          header: "Recepcionista",
          render: (permission) => (
            <PermissionCheckbox
              onToggle={onToggle}
              permission={permission}
              role="Recepcionista"
              savingKey={savingKey}
            />
          ),
        },
      ]}
      data={rows}
      emptyMessage="No hay permisos para mostrar."
    />
  );
}
