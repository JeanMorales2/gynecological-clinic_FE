"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Icon } from "@/components/ui";
import {
  listPermissions,
  PermissionsMatrix,
  PermisosApiError,
  setPermissionGrant,
  type PermissionDefinition,
} from "@/features/permisos";
import { useSession } from "@/stores/session";

export default function Page() {
  const { isLoading: isSessionLoading, user } = useSession();
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      setPermissions(await listPermissions());
    } catch (reason) {
      setLoadError(
        reason instanceof PermisosApiError
          ? reason.message
          : "No se pudo cargar la lista de permisos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSessionLoading || user?.role !== "Admin") return;

    let isCurrent = true;
    async function loadInitialPermissions() {
      try {
        const initialPermissions = await listPermissions();
        if (isCurrent) {
          setPermissions(initialPermissions);
          setLoadError("");
        }
      } catch (reason) {
        if (isCurrent) {
          setLoadError(
            reason instanceof PermisosApiError
              ? reason.message
              : "No se pudo cargar la lista de permisos.",
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadInitialPermissions();
    return () => {
      isCurrent = false;
    };
  }, [isSessionLoading, user]);

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

      {actionError ? (
        <div
          className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger"
          role="alert"
        >
          <Icon name="alert" size={18} />
          <span>{actionError}</span>
        </div>
      ) : null}

      {loadError ? (
        <Card>
          <div className="space-y-3">
            <p className="text-sm text-danger" role="alert">
              {loadError}
            </p>
            <Button onClick={() => void loadPermissions()} variant="outline">
              Reintentar
            </Button>
          </div>
        </Card>
      ) : isLoading ? (
        <p className="text-sm text-text-secondary" role="status">
          Cargando permisos...
        </p>
      ) : (
        <PermissionsMatrix
          onToggle={(permissionKey, role, otorgado) =>
            void handleToggle(permissionKey, role, otorgado)
          }
          permissions={permissions}
          savingKey={savingKey}
        />
      )}
    </div>
  );
}
