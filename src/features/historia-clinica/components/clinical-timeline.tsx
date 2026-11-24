"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Icon, PageMessage, Select, type BadgeTone, type IconName } from "@/components/ui";
import { HistoriaClinicaApiError, listClinicalEntries, type ClinicalEntry, type ClinicalEntryType, type PagedClinicalEntries } from "../api";

type ClinicalTimelineProps = { patientId: string; canManage: boolean; refreshKey: number; onEdit: (entry: ClinicalEntry) => void };
const emptyResult: PagedClinicalEntries = { items: [], totalCount: 0, page: 1, pageSize: 100 };
const dateFormatter = new Intl.DateTimeFormat("es-NI", { dateStyle: "long", timeZone: "UTC" });
export const clinicalTypePresentation: Record<ClinicalEntryType, { tone: BadgeTone; icon: IconName; label: string }> = {
  Consulta: { tone: "info", icon: "clipboard", label: "Consulta" },
  ControlPrenatal: { tone: "accent", icon: "calendar", label: "Control prenatal" },
  Citologia: { tone: "warning", icon: "document", label: "Citología" },
  Ecografia: { tone: "info", icon: "search", label: "Ecografía" },
  Laboratorio: { tone: "neutral", icon: "flask", label: "Laboratorio" },
};

export function ClinicalTimeline({ canManage, onEdit, patientId, refreshKey }: ClinicalTimelineProps) {
  const [tipo, setTipo] = useState<ClinicalEntryType | "">("");
  const [result, setResult] = useState<PagedClinicalEntries>(emptyResult);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    async function loadEntries() {
      setIsLoading(true); setError("");
      try { const entries = await listClinicalEntries({ patientId, tipo: tipo || undefined }); if (isCurrent) setResult(entries); }
      catch (reason) { if (isCurrent) setError(reason instanceof HistoriaClinicaApiError ? reason.message : "No se pudo cargar la historia clínica."); }
      finally { if (isCurrent) setIsLoading(false); }
    }
    void loadEntries();
    return () => { isCurrent = false; };
  }, [patientId, refreshKey, retryKey, tipo]);

  return <section className="space-y-4">
    <div className="max-w-xs"><Select label="Filtrar por tipo" onChange={(event) => setTipo(event.target.value as ClinicalEntryType | "")} options={[{ label: "Todos los tipos", value: "" }, ...Object.entries(clinicalTypePresentation).map(([value, presentation]) => ({ value, label: presentation.label }))]} value={tipo} /></div>
    {error ? <Card><div className="space-y-3"><Button onClick={() => setRetryKey((value) => value + 1)} variant="outline">Reintentar</Button></div><PageMessage message={error} /></Card> : null}
    {!error && isLoading ? <p className="text-sm text-text-secondary" role="status">Cargando historia clínica...</p> : null}
    {!error && !isLoading && result.items.length === 0 ? <Card><div className="flex items-start gap-3"><Icon className="mt-0.5 text-text-secondary" name="clipboard" size={22} /><div><h2 className="font-semibold text-text">Sin entradas clínicas</h2><p className="mt-1 text-sm text-text-secondary">Todavía no hay registros para este paciente.</p></div></div></Card> : null}
    {!error && !isLoading ? <ol aria-label="Línea de tiempo clínica" className="space-y-4">{result.items.map((entry) => {
      const presentation = clinicalTypePresentation[entry.tipo];
      return <li key={entry.id}><Card action={canManage ? <Button aria-label={`Editar entrada del ${entry.fecha}`} onClick={() => onEdit(entry)} size="sm" variant="ghost">Editar</Button> : undefined} title={<div className="flex flex-wrap items-center gap-3"><Badge icon={<Icon name={presentation.icon} size={16} />} tone={presentation.tone}>{presentation.label}</Badge><time className="text-sm font-normal text-text-secondary" dateTime={entry.fecha}>{dateFormatter.format(new Date(`${entry.fecha}T00:00:00Z`))}</time></div>}><div className="space-y-3"><div><h3 className="font-semibold text-text">{entry.motivo}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{entry.hallazgos}</p></div>{entry.diagnostico ? <div><h4 className="text-sm font-semibold text-text">Diagnóstico</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{entry.diagnostico}</p></div> : null}{entry.indicaciones ? <div><h4 className="text-sm font-semibold text-text">Indicaciones</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{entry.indicaciones}</p></div> : null}{entry.tratamiento ? <div><h4 className="text-sm font-semibold text-text">Tratamiento</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{entry.tratamiento}</p></div> : null}{entry.medicamentos ? <div><h4 className="text-sm font-semibold text-text">Medicamentos</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{entry.medicamentos}</p></div> : null}{entry.examenes ? <div><h4 className="text-sm font-semibold text-text">Exámenes</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{entry.examenes}</p></div> : null}{entry.pesoKg !== null || entry.alturaCm !== null ? <p className="text-sm text-text-secondary">{entry.pesoKg !== null ? `Peso: ${entry.pesoKg.toFixed(2)} kg` : null}{entry.pesoKg !== null && entry.alturaCm !== null ? " · " : null}{entry.alturaCm !== null ? `Altura: ${entry.alturaCm.toFixed(1)} cm` : null}</p> : null}</div></Card></li>;
    })}</ol> : null}
  </section>;
}
