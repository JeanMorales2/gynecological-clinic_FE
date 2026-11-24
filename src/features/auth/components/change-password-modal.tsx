"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Modal, PageMessage } from "@/components/ui";
import { changePassword, ChangePasswordError } from "../api/session";

export function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  function reset() {
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setValidationError(""); setServerError("");
  }

  function handleClose() {
    if (isSubmitting) return;
    reset();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(""); setServerError("");
    if (newPassword.length < 8) { setValidationError("La nueva contraseña debe tener al menos 8 caracteres."); return; }
    if (newPassword !== confirmPassword) { setValidationError("Las contraseñas nuevas no coinciden."); return; }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Tu contraseña se cambió correctamente.");
      reset();
      onClose();
    } catch (reason) {
      setServerError(reason instanceof ChangePasswordError ? reason.message : "No se pudo cambiar la contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageMessage message={success} variant="success" />
      <Modal isOpen={isOpen} onClose={handleClose} title="Cambiar contraseña">
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          {validationError ? <p className="text-sm text-danger" role="alert">{validationError}</p> : null}
          {serverError ? <p className="text-sm text-danger" role="alert">{serverError}</p> : null}
          <Input autoComplete="current-password" disabled={isSubmitting} label="Contraseña actual" onChange={(event) => setCurrentPassword(event.target.value)} required type="password" value={currentPassword} />
          <Input autoComplete="new-password" disabled={isSubmitting} label="Contraseña nueva" minLength={8} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} />
          <Input autoComplete="new-password" disabled={isSubmitting} label="Confirmar contraseña nueva" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
          <div className="flex justify-end gap-3">
            <Button disabled={isSubmitting} onClick={handleClose} type="button" variant="outline">Cancelar</Button>
            <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : "Cambiar contraseña"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
