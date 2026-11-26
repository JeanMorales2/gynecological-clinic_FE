"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Icon, Input, PageMessage, useConfirmDialog } from "@/components/ui";
import {
  listPermissions,
  PermissionsMatrix,
  PermisosApiError,
  setPermissionGrant,
  type PermissionDefinition,
} from "@/features/permisos";
import { createRole, deleteRole, listRoles, RolesApiError, type Rol } from "@/features/roles";
import { useSession } from "@/stores/session";

export default function Page() {
  const { confirm } = useConfirmDialog();
  const { isLoading: isSessionLoading, user } = useSession();
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [nuevoRol, setNuevoRol] = useState("");
  const [isCreatingRol, setIsCreatingRol] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [loadedPermissions, loadedRoles] = await Promise.all([listPermissions(), listRoles()]);
      setPermissions(loadedPermissions);
      setRoles(loadedRoles);
    } catch (reason) {
      setLoadError(
        reason instanceof PermisosApiError || reason instanceof RolesApiError
          ? reason.message
          : "No se pudo cargar la lista de permisos y roles.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSessionLoading || user?.role !== "Admin") return;
    void loadAll();
  }, [isSessionLoading, user, loadAll]);

  async function handleToggle(
    permissionKey: string,
    role: string,
    otorgado: boolean,
  ) {
    const cellKey = `${permissionKey}:${role}`;
    setSavingKey(cellKey);
    setActionError("");

    try {
      await setPermissionGrant(role, permissionKey, otorgado);
      setPermissions((currentPermissions) =>
        currentPermissions.map((permission) => {
          if (permission.key !== permissionKey) return permission;

          return {
            ...permission,
            rolesConAcceso: otorgado
              ? [...new Set([...permission.rolesConAcceso, role])]
              : permission.rolesConAcceso.filter(
                  (currentRole) => currentRole !== role,
                ),
          };
        }),
      );
    } catch (reason) {
      setActionError(
        reason instanceof PermisosApiError
          ? reason.message
          : "No se pudo actualizar el permiso.",
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function handleCreateRole() {
    const nombre = nuevoRol.trim();
    if (!nombre) return;
    setIsCreatingRol(true);
    setActionError("");
    try {
      const created = await createRole(nombre);
      setRoles((current) => [...current, created]);
      setNuevoRol("");
    } catch (reason) {
      setActionError(reason instanceof RolesApiError ? reason.message : "No se pudo crear el rol.");
    } finally {
      setIsCreatingRol(false);
    }
  }

  async function handleDeleteRole(rol: Rol) {
    if (!(await confirm(`¿Eliminar el rol "${rol.nombre}"?`, { danger: true, confirmLabel: "Eliminar" }))) return;
    setActionError("");
    try {
      await deleteRole(rol.nombre);
      setRoles((current) => current.filter((item) => item.nombre !== rol.nombre));
    } catch (reason) {
      setActionError(reason instanceof RolesApiError ? reason.message : "No se pudo eliminar el rol.");
    }
  }

  if (isSessionLoading) {
    return (
      <p className="text-sm text-text-secondary" role="status">
        Cargando sesión...
      </p>
    );
  }

  if (user?.role !== "Admin") {
    return (
      <Card>
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <Icon name="info" size={16} />
          Este módulo es solo para administradores.
        </p>
      </Card>
    );
  }

  const roleNamesForMatrix = roles.filter((rol) => rol.nombre !== "Admin").map((rol) => rol.nombre);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Roles y permisos
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Los cambios se aplican de inmediato: cuando revocás o reactivás un
          permiso, la persona lo nota en su próximo inicio de sesión o al
          refrescar su sesión.
        </p>
      </div>

      <PageMessage message={actionError} />

      {loadError ? (
        <Card>
          <div className="space-y-3">
            <Button onClick={() => void loadAll()} variant="outline">
              Reintentar
            </Button>
          </div>
          <PageMessage message={loadError} />
        </Card>
      ) : isLoading ? (
        <p className="text-sm text-text-secondary" role="status">
          Cargando permisos...
        </p>
      ) : (
        <>
          <Card title="Roles">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {roles.map((rol) => (
                  <span className="flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1 text-sm text-text" key={rol.nombre}>
                    {rol.nombre}
                    {!rol.esProtegido ? (
                      <button aria-label={`Eliminar rol ${rol.nombre}`} className="text-text-secondary hover:text-danger" onClick={() => void handleDeleteRole(rol)} type="button">
                        <Icon name="x" size={14} />
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-full max-w-xs"><Input label="Nuevo rol" onChange={(event) => setNuevoRol(event.target.value)} placeholder="Ej.: Enfermera" value={nuevoRol} /></div>
                <Button disabled={!nuevoRol.trim() || isCreatingRol} onClick={() => void handleCreateRole()}>{isCreatingRol ? "Agregando..." : "Agregar rol"}</Button>
              </div>
            </div>
          </Card>
          <PermissionsMatrix
            onToggle={(permissionKey, role, otorgado) =>
              void handleToggle(permissionKey, role, otorgado)
            }
            permissions={permissions}
            roles={roleNamesForMatrix}
            savingKey={savingKey}
          />
        </>
      )}
    </div>
  );
}
