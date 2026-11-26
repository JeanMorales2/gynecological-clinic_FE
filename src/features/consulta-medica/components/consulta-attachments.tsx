"use client";

import { useState } from "react";
import { Button, PageMessage, useConfirmDialog } from "@/components/ui";
import { AttachmentPreviewModal, type AttachmentPreviewTarget } from "@/components/attachment-preview-modal";
import { attachmentDownloadUrl, deleteConsultaAttachment, type ConsultaAttachment, ConsultaMedicaApiError, uploadConsultaAttachment } from "../api";

function formatSize(bytes: number) { return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.ceil(bytes / 1024))} KB`; }

export function ConsultaAttachments({ attachments, canManage, consultaId, onChange }: { attachments: ConsultaAttachment[]; canManage: boolean; consultaId: string; onChange: (items: ConsultaAttachment[]) => void }) {
  const { confirm } = useConfirmDialog();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<AttachmentPreviewTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function upload() {
    if (!file) return; setSubmitting(true); setError(""); setSuccess("");
    try { const created = await uploadConsultaAttachment(consultaId, file); onChange([created, ...attachments]); setFile(null); setSuccess("El adjunto se subió correctamente."); }
    catch (reason) { setError(reason instanceof ConsultaMedicaApiError ? reason.message : "No se pudo subir el adjunto."); }
    finally { setSubmitting(false); }
  }
  async function remove(item: ConsultaAttachment) {
    if (!(await confirm(`¿Eliminar ${item.nombreArchivo}? Esta acción no se puede deshacer.`, { danger: true, confirmLabel: "Eliminar" }))) return;
    setSubmitting(true); setError(""); setSuccess("");
    try { await deleteConsultaAttachment(item.id); onChange(attachments.filter((attachment) => attachment.id !== item.id)); setSuccess("El adjunto se eliminó correctamente."); }
    catch (reason) { setError(reason instanceof ConsultaMedicaApiError ? reason.message : "No se pudo eliminar el adjunto."); }
    finally { setSubmitting(false); }
  }
  return <section className="space-y-4 border-t border-border pt-5"><PageMessage message={error} /><PageMessage message={success} variant="success" /><h3 className="font-semibold text-text">Imágenes y documentos de ultrasonido</h3>
    {attachments.length ? <ul className="space-y-3">{attachments.map((item) => <li className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm" key={item.id}><div><a className="font-medium text-primary hover:underline" download={item.nombreArchivo} href={attachmentDownloadUrl(item.id)}>{item.nombreArchivo}</a><p className="text-text-secondary">{formatSize(item.tamanoBytes)} · {new Date(item.createdAtUtc).toLocaleString()}</p></div><div className="flex gap-2"><Button onClick={() => setPreview({ url: attachmentDownloadUrl(item.id), filename: item.nombreArchivo, contentType: item.tipoContenido })} size="sm" variant="outline">Ver</Button>{canManage ? <Button disabled={submitting} onClick={() => void remove(item)} size="sm" variant="outline">Eliminar</Button> : null}</div></li>)}</ul> : <p className="text-sm text-text-secondary">No hay archivos adjuntos.</p>}
    {canManage ? <div className="flex flex-wrap items-end gap-3"><label className="text-sm font-medium text-text"><span className="mb-1 block">Archivo</span><input accept="application/pdf,image/jpeg,image/png" disabled={submitting} onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" /></label><Button disabled={!file || submitting} onClick={() => void upload()}>{submitting ? "Subiendo..." : "Subir"}</Button></div> : null}
    <AttachmentPreviewModal attachment={preview} onClose={() => setPreview(null)} />
  </section>;
}
