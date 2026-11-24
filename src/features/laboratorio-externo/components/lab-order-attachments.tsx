"use client";

import { useEffect, useState } from "react";
import { Button, useConfirmDialog } from "@/components/ui";
import { attachmentDownloadUrl, deleteLabOrderAttachment, LabOrdersApiError, listLabOrderAttachments, type LabOrderAttachment, uploadLabOrderAttachment } from "../api";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

export function LabOrderAttachments({ labOrderId, canManage }: { labOrderId: string; canManage: boolean }) {
  const { confirm } = useConfirmDialog();
  const [attachments, setAttachments] = useState<LabOrderAttachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let current = true;
    async function loadAttachments() {
      setLoading(true);
      setError("");
      try { const result = await listLabOrderAttachments(labOrderId); if (current) setAttachments(result); }
      catch (reason) { if (current) setError(reason instanceof LabOrdersApiError ? reason.message : "No se pudieron cargar los adjuntos."); }
      finally { if (current) setLoading(false); }
    }
    void loadAttachments();
    return () => { current = false; };
  }, [labOrderId, refreshKey]);

  async function upload() {
    if (!selectedFile) return;
    setSubmitting(true);
    setError("");
    try { await uploadLabOrderAttachment(labOrderId, selectedFile); setSelectedFile(null); setRefreshKey((value) => value + 1); }
    catch (reason) { setError(reason instanceof LabOrdersApiError ? reason.message : "No se pudo subir el archivo."); }
    finally { setSubmitting(false); }
  }

  async function remove(attachment: LabOrderAttachment) {
    if (!(await confirm(`¿Eliminar ${attachment.nombreArchivo}? Esta acción no se puede deshacer.`, { danger: true, confirmLabel: "Eliminar" }))) return;
    setSubmitting(true);
    setError("");
    try { await deleteLabOrderAttachment(attachment.id); setRefreshKey((value) => value + 1); }
    catch (reason) { setError(reason instanceof LabOrdersApiError ? reason.message : "No se pudo eliminar el adjunto."); }
    finally { setSubmitting(false); }
  }

  return <div className="space-y-4">
    {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
    {loading ? <p className="text-sm text-text-secondary">Cargando adjuntos...</p> : attachments.length ? <ul className="space-y-3">{attachments.map((attachment) => <li className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm" key={attachment.id}><div><a className="font-medium text-primary hover:underline" download href={attachmentDownloadUrl(attachment.id)}>{attachment.nombreArchivo}</a><p className="text-text-secondary">{formatSize(attachment.tamanoBytes)} {"\u00b7"} {new Date(attachment.createdAtUtc).toLocaleString()}</p></div>{canManage ? <Button disabled={submitting} onClick={() => void remove(attachment)} size="sm" variant="outline">Eliminar</Button> : null}</li>)}</ul> : <p className="text-sm text-text-secondary">No hay archivos adjuntos.</p>}
    {canManage ? <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4"><label className="text-sm font-medium text-text"><span className="mb-1 block">Archivo</span><input accept="application/pdf,image/jpeg,image/png" disabled={submitting} onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} type="file" /></label><Button disabled={!selectedFile || submitting} onClick={() => void upload()}>{submitting ? "Subiendo..." : "Subir"}</Button></div> : null}
  </div>;
}
