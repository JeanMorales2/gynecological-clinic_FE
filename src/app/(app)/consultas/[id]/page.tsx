"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Button, Card, Icon, Input, Modal, PageMessage, Tabs, useConfirmDialog } from "@/components/ui";
import { ConsultaAttachments } from "@/features/consulta-medica/components";
import { finalizeConsulta, getConsulta, recetaPdfUrl, searchCie10, updateConsulta, ConsultaMedicaApiError, type Cie10Entry, type Consulta, type ConsultaAttachment, type UpdateConsultaInput } from "@/features/consulta-medica";
import { getPatient, type Patient } from "@/features/pacientes";
import { useDebounce } from "@/hooks/use-debounce";
import { todayInClinicTimezone } from "@/lib/dates";
import { hasPermission, useSession } from "@/stores/session";

const textareaClass = "min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-bg disabled:text-text-muted";
const blankToNull = (value: string) => value.trim() || null;
const numberValue = (value: string) => value === "" ? null : Number(value);
function copyForSave(consulta: Consulta): UpdateConsultaInput {
  return {
    presionSistolica: consulta.presionSistolica, presionDiastolica: consulta.presionDiastolica, pesoKg: consulta.pesoKg, tallaCm: consulta.tallaCm,
    fum: consulta.fum, motivoConsulta: consulta.motivoConsulta, padecimientoActual: consulta.padecimientoActual, hallazgosMamas: consulta.hallazgosMamas,
    hallazgosCervixGenitales: consulta.hallazgosCervixGenitales, hallazgosTactoBimanual: consulta.hallazgosTactoBimanual,
    ultrasonidoEndometrioMm: consulta.ultrasonidoEndometrioMm, ultrasonidoOvarioDerecho: consulta.ultrasonidoOvarioDerecho,
    ultrasonidoOvarioIzquierdo: consulta.ultrasonidoOvarioIzquierdo, ultrasonidoSacoGestacionalEmbrion: consulta.ultrasonidoSacoGestacionalEmbrion,
    diagnosticoCie: consulta.diagnosticoCie, diagnosticoDescripcion: consulta.diagnosticoDescripcion, estudiosSolicitados: consulta.estudiosSolicitados,
    indicacionesProximaCita: consulta.indicacionesProximaCita,
    prescriptionItems: consulta.prescriptionItems.map((item, index) => ({ orden: index + 1, medicamento: item.medicamento, dosis: item.dosis, via: item.via, frecuencia: item.frecuencia, duracionTexto: item.duracionTexto })),
  };
}
function fullYears(fecha: string) { const birth = new Date(`${fecha}T12:00:00`); const today = new Date(`${todayInClinicTimezone()}T12:00:00`); let years = today.getFullYear() - birth.getFullYear(); if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) years--; return years; }
function daysSince(value: string) { const from = new Date(`${value}T12:00:00`); const today = new Date(`${todayInClinicTimezone()}T12:00:00`); return Math.floor((today.getTime() - from.getTime()) / 86_400_000); }

export default function ConsultaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { confirm } = useConfirmDialog();
  const canManage = hasPermission(user, "consultas.gestionar");
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [patientModal, setPatientModal] = useState(false);
  const [cieSearch, setCieSearch] = useState("");
  const [cieResults, setCieResults] = useState<Cie10Entry[]>([]);
  const debouncedCieSearch = useDebounce(cieSearch);
  const readOnly = !canManage || consulta?.estado === "Finalizada";

  useEffect(() => {
    let active = true;
    async function loadConsulta() {
      setLoading(true); setError("");
      try { const loaded = await getConsulta(id); const person = await getPatient(loaded.patientId); if (active) { setConsulta(loaded); setPatient(person); } }
      catch (reason) { if (active) setError(reason instanceof ConsultaMedicaApiError ? reason.message : "No se pudo cargar la consulta."); }
      finally { if (active) setLoading(false); }
    }
    void loadConsulta();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    async function loadCieResults() {
      if (!debouncedCieSearch.trim()) { setCieResults([]); return; }
      try { const items = await searchCie10(debouncedCieSearch); if (active) setCieResults(items); }
      catch { if (active) setCieResults([]); }
    }
    void loadCieResults();
    return () => { active = false; };
  }, [cieSearch, debouncedCieSearch]);

  useEffect(() => {
    if (readOnly) return;
    const interval = window.setInterval(() => { if (dirty) void save(true); }, 30_000);
    return () => window.clearInterval(interval);
  // save deliberately reads the latest render state and must not recreate the interval on every edit.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta, dirty, readOnly]);

  function change(mutator: (current: Consulta) => Consulta) { if (readOnly) return; setConsulta((current) => current ? mutator(current) : current); setDirty(true); }
  async function save(automatic = false) {
    if (!consulta || readOnly || saving || (automatic && !dirty)) return;
    setSaving(true); if (!automatic) { setError(""); setSuccess(""); }
    try { const saved = await updateConsulta(consulta.id, copyForSave(consulta)); setConsulta(saved); setDirty(false); setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })); if (!automatic) setSuccess("El borrador se guardó correctamente."); }
    catch (reason) { setError(reason instanceof ConsultaMedicaApiError ? reason.message : "No se pudo guardar la consulta."); }
    finally { setSaving(false); }
  }
  async function leave() { if (dirty && !(await confirm("Tenés cambios sin guardar. Si volvés al listado, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return; router.push("/consultas"); }
  async function finalize() { if (!consulta || !(await confirm("¿Finalizar esta consulta? Una vez finalizada no se podrá editar.", { danger: true, confirmLabel: "Finalizar" }))) return; setSaving(true); setError(""); setSuccess(""); try { const finished = await finalizeConsulta(consulta.id); setConsulta(finished); setDirty(false); setSuccess("La consulta se finalizó correctamente."); } catch (reason) { setError(reason instanceof ConsultaMedicaApiError ? reason.message : "No se pudo finalizar la consulta."); } finally { setSaving(false); } }
  function appendFinding(field: "hallazgosMamas" | "hallazgosCervixGenitales" | "hallazgosTactoBimanual", text: string) { change((current) => ({ ...current, [field]: current[field] ? `${current[field]}, ${text}` : text })); }
  function replaceFinding(field: "hallazgosMamas" | "hallazgosCervixGenitales" | "hallazgosTactoBimanual") { change((current) => ({ ...current, [field]: "Normal / Sin hallazgos patológicos" })); }

  const fumDays = consulta?.fum ? daysSince(consulta.fum) : null;
  const hypertension = Boolean(consulta && ((consulta.presionSistolica ?? 0) >= 140 || (consulta.presionDiastolica ?? 0) >= 90));
  const header = patient && consulta ? <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-bg/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-semibold text-text">{patient.nombreCompleto}</h1><span className="text-sm text-text-secondary">{fullYears(patient.fechaNacimiento)} años</span>{patient.alergias?.trim() ? <Badge icon={<Icon name="alert" size={15} />} tone="danger">Alergias registradas</Badge> : <Badge tone="neutral">Sin alergias</Badge>}</div><p className="mt-1 text-sm text-text-secondary">Sangre: <strong className="text-text">{patient.tipoSangre ?? "No registrado"}</strong> · G{patient.gestas ?? "-"} P{patient.partos ?? "-"} C{patient.cesareas ?? "-"} A{patient.abortos ?? "-"}</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => setPatientModal(true)} size="sm" variant="outline">Ver expediente completo</Button><Button onClick={() => void leave()} size="sm" variant="outline">Volver al listado</Button></div></div></div> : null;
  const tabs = consulta ? [
    { value: "vitales", label: "1. Signos vitales", content: <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Input disabled={readOnly} label="Presión sistólica" min={0} onChange={(event) => change((c) => ({ ...c, presionSistolica: numberValue(event.target.value) }))} type="number" value={consulta.presionSistolica ?? ""} /><Input disabled={readOnly} label="Presión diastólica" min={0} onChange={(event) => change((c) => ({ ...c, presionDiastolica: numberValue(event.target.value) }))} type="number" value={consulta.presionDiastolica ?? ""} /><Input disabled={readOnly} label="Peso (kg)" min={0} onChange={(event) => change((c) => ({ ...c, pesoKg: numberValue(event.target.value) }))} step="0.1" type="number" value={consulta.pesoKg ?? ""} /><Input disabled={readOnly} label="Talla (cm)" min={0} onChange={(event) => change((c) => ({ ...c, tallaCm: numberValue(event.target.value) }))} step="0.1" type="number" value={consulta.tallaCm ?? ""} /></div>{hypertension ? <Badge icon={<Icon name="alert" size={16} />} tone="danger">Presión elevada: verificá posible hipertensión/preeclampsia.</Badge> : null}<div className="rounded-lg bg-bg p-4"><p className="text-sm font-medium text-text">IMC</p><p className="mt-1 text-lg text-text">{consulta.imc ?? "Se calcula al guardar"}</p></div></div> },
    { value: "anamnesis", label: "2. Anamnesis", content: <div className="space-y-4"><Input disabled={readOnly} label="FUM" max={todayInClinicTimezone()} onChange={(event) => change((c) => ({ ...c, fum: event.target.value || null }))} type="date" value={consulta.fum ?? ""} />{fumDays !== null ? <p className="text-sm text-text-secondary">Días desde la FUM: <strong className="text-text">{fumDays}</strong> · Semanas de gestación (si aplica): <strong className="text-text">{Math.floor(fumDays / 7)}</strong></p> : null}<Input disabled={readOnly} label="Motivo de consulta" onChange={(event) => change((c) => ({ ...c, motivoConsulta: event.target.value }))} required value={consulta.motivoConsulta} /><label className="block space-y-2 text-sm font-medium text-text"><span>Padecimiento actual</span><textarea className={textareaClass} disabled={readOnly} onChange={(event) => change((c) => ({ ...c, padecimientoActual: blankToNull(event.target.value) }))} value={consulta.padecimientoActual ?? ""} /></label></div> },
    { value: "exploracion", label: "3. Exploración y ultrasonido", content: <div className="space-y-7">{([ ["hallazgosMamas", "Mamas", ["Nódulo palpable", "Dolor a la palpación"]], ["hallazgosCervixGenitales", "Cérvix / genitales", ["Leucorrea blanquecina", "Ectropión"]], ["hallazgosTactoBimanual", "Tacto bimanual", ["Dolor anexial", "Útero aumentado de tamaño"]] ] as const).map(([field, label, findings]) => <section className="space-y-3" key={field}><h3 className="font-semibold text-text">{label}</h3><div className="flex flex-wrap gap-2"><Button disabled={readOnly} onClick={() => replaceFinding(field)} size="sm" variant="outline">Normal / Sin hallazgos patológicos</Button>{findings.map((finding) => <Button disabled={readOnly} key={finding} onClick={() => appendFinding(field, finding)} size="sm" variant="ghost">{finding}</Button>)}</div><textarea className={textareaClass} disabled={readOnly} onChange={(event) => change((c) => ({ ...c, [field]: blankToNull(event.target.value) }))} value={consulta[field] ?? ""} /></section>)}<section className="space-y-4 border-t border-border pt-5"><h3 className="font-semibold text-text">Ultrasonido</h3><div className="grid gap-4 sm:grid-cols-2"><Input disabled={readOnly} label="Endometrio (mm)" min={0} onChange={(event) => change((c) => ({ ...c, ultrasonidoEndometrioMm: numberValue(event.target.value) }))} step="0.1" type="number" value={consulta.ultrasonidoEndometrioMm ?? ""} /><Input disabled={readOnly} label="Ovario derecho" onChange={(event) => change((c) => ({ ...c, ultrasonidoOvarioDerecho: blankToNull(event.target.value) }))} value={consulta.ultrasonidoOvarioDerecho ?? ""} /><Input disabled={readOnly} label="Ovario izquierdo" onChange={(event) => change((c) => ({ ...c, ultrasonidoOvarioIzquierdo: blankToNull(event.target.value) }))} value={consulta.ultrasonidoOvarioIzquierdo ?? ""} /><Input disabled={readOnly} label="Saco gestacional / embrión" onChange={(event) => change((c) => ({ ...c, ultrasonidoSacoGestacionalEmbrion: blankToNull(event.target.value) }))} value={consulta.ultrasonidoSacoGestacionalEmbrion ?? ""} /></div></section><ConsultaAttachments attachments={consulta.attachments} canManage={!readOnly} consultaId={consulta.id} onChange={(attachments: ConsultaAttachment[]) => setConsulta((current) => current ? { ...current, attachments } : current)} /></div> },
    { value: "plan", label: "4. Diagnóstico y plan", content: <div className="space-y-6"><div className="relative"><Input disabled={readOnly} label="Buscar CIE-10" onChange={(event) => { setCieSearch(event.target.value); if (!event.target.value) setCieResults([]); }} placeholder="Código o diagnóstico" value={cieSearch} />{cieResults.length ? <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">{cieResults.map((entry) => <li key={entry.codigo}><button className="w-full px-3 py-2 text-left text-sm hover:bg-bg" disabled={readOnly} onClick={() => { change((c) => ({ ...c, diagnosticoCie: entry.codigo, diagnosticoDescripcion: entry.descripcion })); setCieSearch(""); setCieResults([]); }} type="button"><strong>{entry.codigo}</strong> · {entry.descripcion}</button></li>)}</ul> : null}</div><div className="grid gap-4 sm:grid-cols-2"><Input disabled={readOnly} label="Código CIE-10" onChange={(event) => change((c) => ({ ...c, diagnosticoCie: blankToNull(event.target.value) }))} value={consulta.diagnosticoCie ?? ""} /><Input disabled={readOnly} label="Descripción diagnóstica" onChange={(event) => change((c) => ({ ...c, diagnosticoDescripcion: blankToNull(event.target.value) }))} value={consulta.diagnosticoDescripcion ?? ""} /></div><section className="space-y-4 border-t border-border pt-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-text">Receta</h3>{!readOnly ? <Button onClick={() => change((c) => ({ ...c, prescriptionItems: [...c.prescriptionItems, { id: crypto.randomUUID(), orden: c.prescriptionItems.length + 1, medicamento: "", dosis: "", via: "", frecuencia: "", duracionTexto: "" }] }))} size="sm" variant="outline">Agregar medicamento</Button> : null}</div>{consulta.prescriptionItems.length ? <div className="space-y-4">{consulta.prescriptionItems.map((item, index) => <div className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-5" key={item.id}>{([ ["medicamento", "Medicamento"], ["dosis", "Dosis"], ["via", "Vía"], ["frecuencia", "Frecuencia"], ["duracionTexto", "Duración"] ] as const).map(([field, label]) => <Input disabled={readOnly} key={field} label={label} onChange={(event) => change((c) => ({ ...c, prescriptionItems: c.prescriptionItems.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: event.target.value } : row) }))} value={item[field]} />)}{!readOnly ? <Button className="lg:col-span-5" onClick={() => change((c) => ({ ...c, prescriptionItems: c.prescriptionItems.filter((_, rowIndex) => rowIndex !== index) }))} size="sm" variant="ghost">Quitar</Button> : null}</div>)}</div> : <p className="text-sm text-text-secondary">No hay medicamentos cargados.</p>}<a href={recetaPdfUrl(consulta.id)} rel="noreferrer" target="_blank"><Button className="mt-3" variant="outline">Ver/Descargar receta en PDF</Button></a></section><div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2 text-sm font-medium text-text"><span>Estudios solicitados</span><textarea className={textareaClass} disabled={readOnly} onChange={(event) => change((c) => ({ ...c, estudiosSolicitados: blankToNull(event.target.value) }))} value={consulta.estudiosSolicitados ?? ""} /></label><label className="block space-y-2 text-sm font-medium text-text"><span>Indicaciones de próxima cita</span><textarea className={textareaClass} disabled={readOnly} onChange={(event) => change((c) => ({ ...c, indicacionesProximaCita: blankToNull(event.target.value) }))} value={consulta.indicacionesProximaCita ?? ""} /></label></div></div> },
  ] : [];

  if (loading) return <p className="text-sm text-text-secondary">Cargando consulta...</p>;
  if (!consulta || !patient) return <div className="space-y-4"><PageMessage message={error || "No se encontró la consulta."} /><Button onClick={() => router.push("/consultas")} variant="outline">Volver al listado</Button></div>;
  return <div className="-mx-4 -my-6 sm:-mx-6"><PageMessage message={error} /><PageMessage message={success} variant="success" />{header}<div className="space-y-5 px-4 py-6 sm:px-6">{consulta.estado === "Finalizada" ? <Card><div className="flex items-center gap-3"><Icon className="text-success" name="check" size={24} /><div><h2 className="font-semibold text-text">Esta consulta está finalizada</h2><p className="text-sm text-text-secondary">Su contenido es de solo lectura.</p></div></div></Card> : null}<Card><Tabs tabs={tabs} /></Card>{!readOnly ? <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-text-secondary">{saving ? "Guardando..." : savedAt ? `Guardado automáticamente a las ${savedAt}` : dirty ? "Cambios sin guardar" : "Sin cambios pendientes"}</p><div className="flex gap-2"><Button disabled={saving} onClick={() => void save()} variant="outline">Guardar borrador</Button><Button disabled={saving} onClick={() => void finalize()} variant="danger">Finalizar y cerrar consulta</Button></div></div> : null}</div><Modal isOpen={patientModal} onClose={() => setPatientModal(false)} title="Expediente de paciente"><div className="space-y-3 text-sm"><p><strong>Nombre:</strong> {patient.nombreCompleto}</p><p><strong>Fecha de nacimiento:</strong> {patient.fechaNacimiento}</p><p><strong>Teléfono:</strong> {patient.telefono}</p><p><strong>Correo:</strong> {patient.email ?? "No registrado"}</p><p><strong>Documento:</strong> {patient.documentoIdentidad ?? "No registrado"}</p><p><strong>Alergias:</strong> {patient.alergias ?? "No registradas"}</p><p><strong>Antecedentes patológicos personales:</strong> {patient.antecedentesPatologicosPersonales ?? "No registrados"}</p><p><strong>Antecedentes patológicos familiares:</strong> {patient.antecedentesPatologicosFamiliares ?? "No registrados"}</p><p><strong>Antecedentes quirúrgicos:</strong> {patient.antecedentesQuirurgicos ?? "No registrados"}</p><p><strong>Menarca:</strong> {patient.menarca ?? "No registrada"}</p><p><strong>Ciclos:</strong> {patient.ciclos ?? "No registrados"}</p><p><strong>IVSA:</strong> {patient.ivsa ?? "No registrado"}</p><p><strong>FUM:</strong> {patient.fum ?? "No registrada"}</p><p><strong>MPF:</strong> {patient.mpf ?? "No registrado"}</p><p><strong>PAP:</strong> {patient.pap ?? "No registrado"}</p><p><strong>Complicaciones:</strong> {patient.complicaciones ?? "No registradas"}</p></div></Modal></div>;
}
