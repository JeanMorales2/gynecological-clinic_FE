"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui";

export type AttachmentPreviewTarget = {
  url: string;
  filename: string;
  contentType: string;
};

type AttachmentPreviewModalProps = {
  attachment: AttachmentPreviewTarget | null;
  onClose: () => void;
};

export function AttachmentPreviewModal({ attachment, onClose }: AttachmentPreviewModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!attachment) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    const timer = window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.clearTimeout(timer); };
  }, [attachment, onClose]);

  if (!attachment) return null;
  const isImage = attachment.contentType.startsWith("image/");
  const isPdf = attachment.contentType === "application/pdf";

  return <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
  >
    <div
      aria-label={`Vista previa de ${attachment.filename}`}
      aria-modal="true"
      className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl outline-none"
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="truncate text-lg font-semibold text-text">{attachment.filename}</h2>
        <button aria-label="Cerrar vista previa" className="rounded-md p-1 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary" onClick={onClose} type="button"><Icon name="x" size={20} /></button>
      </header>
      <div className="flex min-h-[50vh] flex-1 items-center justify-center overflow-auto bg-bg p-4">
        {isImage ? <img alt={attachment.filename} className="max-h-[70vh] max-w-full object-contain" src={attachment.url} /> : null}
        {isPdf ? <iframe className="h-[70vh] w-full rounded-lg border border-border" src={attachment.url} title={attachment.filename} /> : null}
        {!isImage && !isPdf ? <div className="flex flex-col items-center gap-3 text-center text-text-secondary">
          <Icon name="document" size={40} />
          <p className="text-sm">No hay vista previa disponible para este tipo de archivo.</p>
          <a className="font-medium text-primary hover:underline" download href={attachment.url}>Descargar {attachment.filename}</a>
        </div> : null}
      </div>
    </div>
  </div>;
}
