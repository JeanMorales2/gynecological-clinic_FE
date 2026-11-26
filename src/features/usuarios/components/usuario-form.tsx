"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Icon, Input, Select } from "@/components/ui";
import { listRoles, RolesApiError } from "@/features/roles";
import type { StaffRole, StaffUser } from "../api";

export type UsuarioFormValues = {
  email?: string;
  password?: string;
  nombreCompleto: string;
  telefono: string | null;
  role: StaffRole;
};

type UsuarioFormProps = {
  user: StaffUser | null;
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (values: UsuarioFormValues) => Promise<void>;
};

const roleLabels: Record<string, string> = {
  Admin: "Administrador",
  Recepcionista: "Recepcionista",
  Ginecologa: "Ginecóloga",
};

export function UsuarioForm({ isSubmitting, onCancel, onDirtyChange, onSubmit, submitError, user }: UsuarioFormProps) {
  const isEditing = Boolean(user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState(user?.nombreCompleto ?? "");
  const [telefono, setTelefono] = useState(user?.telefono ?? "");
  const [role, setRole] = useState<StaffRole>(user?.role ?? "Recepcionista");
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([{ value: "Recepcionista", label: "Recepcionista" }]);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    void listRoles()
      .then((roles) => { if (isCurrent) setRoleOptions(roles.map((rol) => ({ value: rol.nombre, label: roleLabels[rol.nombre] ?? rol.nombre }))); })
      .catch((reason) => { if (isCurrent && reason instanceof RolesApiError) { /* keep fallback options */ } });
    return () => { isCurrent = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = nombreCompleto.trim();
    if (!normalizedName) {
      setValidationError("Ingresá el nombre completo.");
      return;
    }
    if (!isEditing && (!email.trim() || !password)) {
      setValidationError("Ingresá el correo electrónico y la contraseña inicial.");
      return;
    }

    setValidationError("");
    await onSubmit({
      ...(isEditing ? {} : { email: email.trim(), password }),
      nombreCompleto: normalizedName,
      telefono: telefono.trim() || null,
      role,
    });
  }

  const error = validationError || submitError;
  return (
    <form className="space-y-4" onChange={() => onDirtyChange?.(true)} onSubmit={handleSubmit}>
      {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
      {!isEditing ? <>
        <Input autoComplete="email" label="Correo electrónico" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        <Input autoComplete="new-password" label="Contraseña inicial" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </> : null}
      <Input autoComplete="name" label="Nombre completo" onChange={(event) => setNombreCompleto(event.target.value)} required value={nombreCompleto} />
      <Input autoComplete="tel" label="Teléfono" onChange={(event) => setTelefono(event.target.value)} type="tel" value={telefono} />
      <Select label="Rol" onChange={(event) => setRole(event.target.value as StaffRole)} options={roleOptions} value={role} />
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button>
        <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}</Button>
      </div>
    </form>
  );
}
