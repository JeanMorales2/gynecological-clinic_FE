"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Icon, Input, Select, Tabs } from "@/components/ui";
import { todayInClinicTimezone } from "@/lib/dates";
import type { Patient, PatientInput } from "../api";

type ReferidoInput = {
  nombreCompleto: string;
  telefono: string;
  telefonoAlternativo: string | null;
};

type PacienteFormProps = {
  patient: Patient | null;
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (values: PatientInput, referidos?: ReferidoInput[]) => Promise<void>;
};

export function PacienteForm({ isSubmitting, onCancel, onDirtyChange, onSubmit, patient, submitError }: PacienteFormProps) {
  const [nombreCompleto, setNombreCompleto] = useState(patient?.nombreCompleto ?? "");
  const [fechaNacimiento, setFechaNacimiento] = useState(patient?.fechaNacimiento ?? "");
  const [telefono, setTelefono] = useState(patient?.telefono ?? "");
  const [email, setEmail] = useState(patient?.email ?? "");
  const [documentoIdentidad, setDocumentoIdentidad] = useState(patient?.documentoIdentidad ?? "");
  const [alergias, setAlergias] = useState(patient?.alergias ?? "");
  const [antecedentesPatologicosPersonales, setAntecedentesPatologicosPersonales] = useState(patient?.antecedentesPatologicosPersonales ?? "");
  const [antecedentesPatologicosFamiliares, setAntecedentesPatologicosFamiliares] = useState(patient?.antecedentesPatologicosFamiliares ?? "");
  const [antecedentesQuirurgicos, setAntecedentesQuirurgicos] = useState(patient?.antecedentesQuirurgicos ?? "");
  const [menarca, setMenarca] = useState(patient?.menarca ?? "");
  const [ciclos, setCiclos] = useState(patient?.ciclos ?? "");
  const [ivsa, setIvsa] = useState(patient?.ivsa ?? "");
  const [fum, setFum] = useState(patient?.fum ?? "");
  const [mpf, setMpf] = useState(patient?.mpf ?? "");
  const [pap, setPap] = useState(patient?.pap ?? "");
  const [complicaciones, setComplicaciones] = useState(patient?.complicaciones ?? "");
  const [tipoSangre, setTipoSangre] = useState(patient?.tipoSangre ?? "");
  const [gestas, setGestas] = useState(patient?.gestas?.toString() ?? "");
  const [partos, setPartos] = useState(patient?.partos?.toString() ?? "");
  const [cesareas, setCesareas] = useState(patient?.cesareas?.toString() ?? "");
  const [abortos, setAbortos] = useState(patient?.abortos?.toString() ?? "");
  const [referido1NombreCompleto, setReferido1NombreCompleto] = useState("");
  const [referido1Telefono, setReferido1Telefono] = useState("");
  const [referido1TelefonoAlternativo, setReferido1TelefonoAlternativo] = useState("");
  const [referido2NombreCompleto, setReferido2NombreCompleto] = useState("");
  const [referido2Telefono, setReferido2Telefono] = useState("");
  const [referido2TelefonoAlternativo, setReferido2TelefonoAlternativo] = useState("");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nombreCompleto.trim() || !fechaNacimiento || !telefono.trim()) {
      setValidationError("Completá nombre, fecha de nacimiento y teléfono.");
      return;
    }
    setValidationError("");
    const values = {
      nombreCompleto: nombreCompleto.trim(),
      fechaNacimiento,
      telefono: telefono.trim(),
      email: email.trim() || null,
      documentoIdentidad: documentoIdentidad.trim() || null,
      alergias: alergias.trim() || null,
      antecedentesPatologicosPersonales: antecedentesPatologicosPersonales.trim() || null,
      antecedentesPatologicosFamiliares: antecedentesPatologicosFamiliares.trim() || null,
      antecedentesQuirurgicos: antecedentesQuirurgicos.trim() || null,
      menarca: menarca.trim() || null,
      ciclos: ciclos.trim() || null,
      ivsa: ivsa.trim() || null,
      fum: fum || null,
      mpf: mpf.trim() || null,
      pap: pap.trim() || null,
      complicaciones: complicaciones.trim() || null,
      tipoSangre: tipoSangre || null,
      gestas: gestas.trim() ? Number(gestas) : null,
      partos: partos.trim() ? Number(partos) : null,
      cesareas: cesareas.trim() ? Number(cesareas) : null,
      abortos: abortos.trim() ? Number(abortos) : null,
    };
    const referidos = !patient ? [
      { nombreCompleto: referido1NombreCompleto, telefono: referido1Telefono, telefonoAlternativo: referido1TelefonoAlternativo },
      { nombreCompleto: referido2NombreCompleto, telefono: referido2Telefono, telefonoAlternativo: referido2TelefonoAlternativo },
    ].filter((referido) => referido.nombreCompleto.trim() && referido.telefono.trim()).map((referido) => ({
      nombreCompleto: referido.nombreCompleto.trim(),
      telefono: referido.telefono.trim(),
      telefonoAlternativo: referido.telefonoAlternativo.trim() || null,
    })) : undefined;
    await onSubmit(values, referidos);
  }

  const error = validationError || submitError;
  return <form className="space-y-4" onChange={() => onDirtyChange?.(true)} onSubmit={handleSubmit}>
    {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
    <Tabs tabs={[
      {
        label: "Datos personales",
        value: "datos",
        content: <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input autoComplete="name" label="Nombre completo" onChange={(event) => setNombreCompleto(event.target.value)} required value={nombreCompleto} /></div>
          <Input label="Fecha de nacimiento" max={todayInClinicTimezone()} onChange={(event) => setFechaNacimiento(event.target.value)} required type="date" value={fechaNacimiento} />
          <Input autoComplete="tel" label="Teléfono" onChange={(event) => setTelefono(event.target.value)} required type="tel" value={telefono} />
          <Input autoComplete="email" label="Correo electrónico" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          <Input label="Documento de identidad" onChange={(event) => setDocumentoIdentidad(event.target.value)} value={documentoIdentidad} />
        </div>,
      },
      {
        label: "Antecedentes patológicos",
        value: "antecedentes",
        content: <div className="space-y-4">
          {alergias.trim() ? <Badge icon={<Icon name="alert" size={16} />} tone="danger">Alergias registradas: verificá esta información clínica.</Badge> : null}
          <label className="block space-y-2 text-sm font-medium text-text">
            <span>Alergias</span>
            <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-danger focus:ring-2 focus:ring-danger" onChange={(event) => setAlergias(event.target.value)} placeholder="Ej.: alergia a penicilina" value={alergias} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-text">
            <span>Antecedentes patológicos personales</span>
            <textarea className="min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setAntecedentesPatologicosPersonales(event.target.value)} value={antecedentesPatologicosPersonales} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-text">
            <span>Antecedentes patológicos familiares</span>
            <textarea className="min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setAntecedentesPatologicosFamiliares(event.target.value)} value={antecedentesPatologicosFamiliares} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-text">
            <span>Antecedentes quirúrgicos</span>
            <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setAntecedentesQuirurgicos(event.target.value)} value={antecedentesQuirurgicos} />
          </label>
        </div>,
      },
      {
        label: "Antecedentes ginecológicos",
        value: "antecedentes-ginecologicos",
        content: <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Menarca" onChange={(event) => setMenarca(event.target.value)} placeholder="Ej.: 12 años" value={menarca} />
          <Input label="Ciclos" onChange={(event) => setCiclos(event.target.value)} placeholder="Ej.: 28x5, regulares" value={ciclos} />
          <Input label="IVSA" onChange={(event) => setIvsa(event.target.value)} placeholder="Ej.: 16 años" value={ivsa} />
          <Input label="FUM" onChange={(event) => setFum(event.target.value)} type="date" value={fum} />
          <Input label="MPF" onChange={(event) => setMpf(event.target.value)} placeholder="Método de planificación familiar" value={mpf} />
          <Input label="PAP" onChange={(event) => setPap(event.target.value)} placeholder="Fecha y/o resultado" value={pap} />
          <Select label="Tipo de sangre" onChange={(event) => setTipoSangre(event.target.value)} options={[{ label: "No registrado", value: "" }, ...["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((tipo) => ({ label: tipo, value: tipo }))]} value={tipoSangre} />
          <div />
          <div className="sm:col-span-2 grid grid-cols-4 gap-3">
            <Input label="Gestas (G)" min={0} onChange={(event) => setGestas(event.target.value)} type="number" value={gestas} />
            <Input label="Partos (P)" min={0} onChange={(event) => setPartos(event.target.value)} type="number" value={partos} />
            <Input label="Cesáreas (C)" min={0} onChange={(event) => setCesareas(event.target.value)} type="number" value={cesareas} />
            <Input label="Abortos (A)" min={0} onChange={(event) => setAbortos(event.target.value)} type="number" value={abortos} />
          </div>
          <label className="sm:col-span-2 block space-y-2 text-sm font-medium text-text">
            <span>Complicaciones</span>
            <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setComplicaciones(event.target.value)} value={complicaciones} />
          </label>
        </div>,
      },
      ...(!patient ? [{
        label: "Personas referidas",
        value: "referidos",
        content: <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text">Referido 1</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Input label="Nombre completo" onChange={(event) => setReferido1NombreCompleto(event.target.value)} value={referido1NombreCompleto} /></div>
              <Input label="Teléfono principal" onChange={(event) => setReferido1Telefono(event.target.value)} type="tel" value={referido1Telefono} />
              <Input label="Teléfono alternativo (opcional)" onChange={(event) => setReferido1TelefonoAlternativo(event.target.value)} type="tel" value={referido1TelefonoAlternativo} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text">Referido 2</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Input label="Nombre completo" onChange={(event) => setReferido2NombreCompleto(event.target.value)} value={referido2NombreCompleto} /></div>
              <Input label="Teléfono principal" onChange={(event) => setReferido2Telefono(event.target.value)} type="tel" value={referido2Telefono} />
              <Input label="Teléfono alternativo (opcional)" onChange={(event) => setReferido2TelefonoAlternativo(event.target.value)} type="tel" value={referido2TelefonoAlternativo} />
            </div>
          </div>
        </div>,
      }] : []),
    ]} />
    <div className="flex flex-wrap justify-end gap-3 pt-2">
      <Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button>
      <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : patient ? "Guardar cambios" : "Crear paciente"}</Button>
    </div>
  </form>;
}
