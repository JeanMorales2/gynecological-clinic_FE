"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Icon, Modal, PageMessage, useConfirmDialog } from "@/components/ui";
import {
  createStaff,
  deactivateStaff,
  listStaff,
  reactivateStaff,
  updateStaff,
  UsuarioForm,
  UsuariosApiError,
  UsuariosTable,
  type StaffUser,
  type UsuarioFormValues,
} from "@/features/usuarios";
import { hasPermission, useSession } from "@/stores/session";

export default function Page() {
  const { confirm } = useConfirmDialog();
  const { isLoading: isSessionLoading, user } = useSession();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setUsers(await listStaff());
    } catch (reason) {
      setLoadError(
        reason instanceof UsuariosApiError
          ? reason.message
          : "No se pudo cargar la lista de usuarios.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSessionLoading || !hasPermission(user, "usuarios.gestionar")) return;

    let isCurrent = true;
    async function loadInitialUsers() {
      try {
        const staffUsers = await listStaff();
        if (isCurrent) {
          setUsers(staffUsers);
          setLoadError("");
        }
      } catch (reason) {
        if (isCurrent)
          setLoadError(
            reason instanceof UsuariosApiError
              ? reason.message
              : "No se pudo cargar la lista de usuarios.",
          );
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadInitialUsers();
    return () => {
      isCurrent = false;
    };
  }, [isSessionLoading, user]);

  function openNewUserModal() {
    setEditingUser(null);
    setFormError("");
    setIsFormDirty(false);
    setIsModalOpen(true);
  }

  function openEditUserModal(staffUser: StaffUser) {
    setEditingUser(staffUser);
    setFormError("");
    setIsFormDirty(false);
    setIsModalOpen(true);
  }

  async function closeModal() {
    if (isSubmitting) return;
    if (isFormDirty && !(await confirm("Tenés cambios sin guardar. Si salís ahora, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return;
    setIsModalOpen(false);
    setFormError("");
    setIsFormDirty(false);
  }

  async function handleSubmit(values: UsuarioFormValues) {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingUser) {
        const updatedUser = await updateStaff(editingUser.id, {
          nombreCompleto: values.nombreCompleto,
          telefono: values.telefono,
          role: values.role,
        });
        setUsers((currentUsers) =>
          currentUsers.map((staffUser) =>
            staffUser.id === updatedUser.id ? updatedUser : staffUser,
          ),
        );
      } else {
        const createdUser = await createStaff({
          email: values.email ?? "",
          password: values.password ?? "",
          nombreCompleto: values.nombreCompleto,
          telefono: values.telefono,
          role: values.role,
        });
        setUsers((currentUsers) => [...currentUsers, createdUser]);
      }
      setIsModalOpen(false);
    } catch (reason) {
      setFormError(
        reason instanceof UsuariosApiError
          ? reason.message
          : "No se pudo guardar el usuario.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(staffUser: StaffUser) {
    if (!(await confirm(`¿Desactivar a ${staffUser.nombreCompleto}? Esta persona ya no podrá iniciar sesión.`, { danger: true, confirmLabel: "Desactivar" })))
      return;

    setActionError("");
    setIsUpdatingId(staffUser.id);
    try {
      const deactivatedUser = await deactivateStaff(staffUser.id);
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === deactivatedUser.id ? deactivatedUser : currentUser,
        ),
      );
    } catch (reason) {
      setActionError(
        reason instanceof UsuariosApiError
          ? reason.message
          : "No se pudo desactivar el usuario.",
      );
    } finally {
      setIsUpdatingId(null);
    }
  }

  async function handleReactivate(staffUser: StaffUser) {
    if (!(await confirm(`¿Reactivar a ${staffUser.nombreCompleto}? Podrá volver a iniciar sesión.`, { confirmLabel: "Reactivar" })))
      return;

    setActionError("");
    setIsUpdatingId(staffUser.id);
    try {
      const reactivatedUser = await reactivateStaff(staffUser.id);
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === reactivatedUser.id ? reactivatedUser : currentUser,
        ),
      );
    } catch (reason) {
      setActionError(
        reason instanceof UsuariosApiError
          ? reason.message
          : "No se pudo reactivar el usuario.",
      );
    } finally {
      setIsUpdatingId(null);
    }
  }

  if (isSessionLoading) {
    return (
      <p className="text-sm text-text-secondary" role="status">
        Cargando sesión...
      </p>
    );
  }

  if (!hasPermission(user, "usuarios.gestionar")) {
    return (
      <Card className="max-w-xl">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 text-warning" name="info" size={24} />
          <div>
            <h1 className="text-xl font-semibold text-text">Sin permiso</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Solo las cuentas administradoras pueden gestionar usuarios y
              roles.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Usuarios y roles
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Administrá las cuentas del personal de la clínica.
          </p>
        </div>
        <Button
          leadingIcon={<Icon name="plus" size={18} />}
          onClick={openNewUserModal}
        >
          Nuevo usuario
        </Button>
      </div>

      <PageMessage message={actionError} />
      {loadError ? (
        <><PageMessage message={loadError} /><Card>
          <div className="space-y-3">
            <Button onClick={() => void loadUsers()} variant="outline">
              Reintentar
            </Button>
          </div>
        </Card></>
      ) : null}
      {!loadError ? (
        isLoading ? (
          <p className="text-sm text-text-secondary" role="status">
            Cargando usuarios...
          </p>
        ) : (
          <UsuariosTable
            isUpdatingId={isUpdatingId}
            onDeactivate={(staffUser) => void handleDeactivate(staffUser)}
            onEdit={openEditUserModal}
            onReactivate={(staffUser) => void handleReactivate(staffUser)}
            users={users}
          />
        )
      ) : null}

      <Modal
        isOpen={isModalOpen}
        onClose={() => void closeModal()}
        title={editingUser ? "Editar usuario" : "Nuevo usuario"}
      >
        <UsuarioForm
          isSubmitting={isSubmitting}
          key={editingUser?.id ?? "new"}
          onCancel={() => void closeModal()}
          onDirtyChange={setIsFormDirty}
          onSubmit={handleSubmit}
          submitError={formError}
          user={editingUser}
        />
      </Modal>
    </div>
  );
}
