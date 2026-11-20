"use client";

import { useState } from "react";
import type { ThemePreference } from "@/stores/theme";
import { useTheme } from "@/stores/theme";
import { Badge, Button, Card, Icon, Input, Modal, Select, Table, Tabs, type TableColumn } from "@/components/ui";

type PatientRow = {
  id: number;
  name: string;
  appointment: string;
  status: "Activo" | "Pendiente" | "Alterado";
};

const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
  { label: "Automático", value: "auto" },
];

const patients: PatientRow[] = [
  { id: 1, name: "María López", appointment: "18 nov. · 09:00", status: "Activo" },
  { id: 2, name: "Ana Martínez", appointment: "18 nov. · 11:30", status: "Pendiente" },
  { id: 3, name: "Sofía Hernández", appointment: "19 nov. · 08:30", status: "Alterado" },
];

const tableColumns: TableColumn<PatientRow>[] = [
  { key: "name", header: "Paciente" },
  { key: "appointment", header: "Próxima cita" },
  {
    key: "status",
    header: "Estado",
    render: (patient) => {
      const status = {
        Activo: { icon: <Icon name="check" size={16} />, tone: "success" as const },
        Pendiente: { icon: <Icon name="clock" size={16} />, tone: "warning" as const },
        Alterado: { icon: <Icon name="alert" size={16} />, tone: "danger" as const },
      }[patient.status];
      return <Badge icon={status.icon} tone={status.tone}>{patient.status}</Badge>;
    },
  },
];

export default function UiKitPage() {
  const { theme, setTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-text sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-accent-text">Sistema de diseño</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Componentes UI</h1>
            <p className="mt-3 max-w-2xl text-base text-text-secondary">Inventario visual de los componentes base para la interfaz de la clínica.</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-text">Tema</p>
            <div aria-label="Selector de tema" className="flex flex-wrap gap-2">
              {themeOptions.map((option) => (
                <Button
                  aria-pressed={theme === option.value}
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  size="sm"
                  variant={theme === option.value ? "primary" : "outline"}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        <section aria-labelledby="button-heading">
          <h2 className="text-2xl font-semibold" id="button-heading">Button</h2>
          <p className="mt-2 text-text-secondary">Por vista de producto debe haber una sola acción primaria rellena; esta página la repite exclusivamente para documentar sus variantes.</p>
          <Card className="mt-4" title="Variantes y tamaños">
            <div className="space-y-5">
              {(["sm", "md", "lg"] as const).map((size) => (
                <div className="flex flex-wrap items-center gap-3" key={size}>
                  <span className="w-8 text-sm text-text-secondary">{size}</span>
                  <Button leadingIcon={<Icon name="plus" size={16} />} size={size}>Nueva cita</Button>
                  <Button size={size} variant="outline">Editar</Button>
                  <Button size={size} trailingIcon={<Icon name="document" size={16} />} variant="ghost">Ver detalle</Button>
                  <Button disabled size={size}>No disponible</Button>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section aria-labelledby="card-heading">
          <h2 className="text-2xl font-semibold" id="card-heading">Card</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card action={<Button size="sm" variant="ghost">Ver todo</Button>} title="Próximas citas">
              <p className="text-text-secondary">Contenedor con encabezado y una acción alineada a la derecha.</p>
            </Card>
            <Card>
              <p className="font-medium">Contenido sin encabezado</p>
              <p className="mt-2 text-text-secondary">También puede usarse como superficie base para secciones simples.</p>
            </Card>
          </div>
        </section>

        <section aria-labelledby="badge-heading">
          <h2 className="text-2xl font-semibold" id="badge-heading">Badge</h2>
          <p className="mt-2 text-text-secondary">Cada estado incluye un ícono además del texto para no depender solamente del color.</p>
          <Card className="mt-4">
            <div className="flex flex-wrap gap-3">
              <Badge icon={<Icon name="check" size={16} />} tone="success">Activo</Badge>
              <Badge icon={<Icon name="clock" size={16} />} tone="warning">Pendiente</Badge>
              <Badge icon={<Icon name="alert" size={16} />} tone="danger">Alterado</Badge>
              <Badge icon={<Icon name="info" size={16} />} tone="info">Informativo</Badge>
              <Badge icon={<Icon name="circle" size={16} />} tone="neutral">Sin asignar</Badge>
              <Badge icon={<Icon name="sparkles" size={16} />} tone="accent">Promoción</Badge>
            </div>
          </Card>
        </section>

        <section aria-labelledby="form-heading">
          <h2 className="text-2xl font-semibold" id="form-heading">Input y Select</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card title="Campos de texto">
              <div className="space-y-5">
                <Input label="Nombre completo" placeholder="Escribí el nombre de la paciente" />
                <Input error="Ingresá un correo electrónico válido." label="Correo electrónico" placeholder="nombre@ejemplo.com" type="email" />
                <Input disabled label="Número de expediente" value="GYN-0001" readOnly />
              </div>
            </Card>
            <Card title="Selección nativa">
              <div className="space-y-5">
                <Select label="Profesional" options={[{ label: "Seleccioná una profesional", value: "" }, { label: "Dra. Ana Ruiz", value: "ana" }, { label: "Dra. Lucía Pérez", value: "lucia" }]} />
                <Select error="Seleccioná el tipo de consulta." label="Tipo de consulta" options={[{ label: "Elegí una opción", value: "" }]} />
                <Select disabled label="Sucursal" options={[{ label: "Managua", value: "managua" }]} value="managua" />
              </div>
            </Card>
          </div>
        </section>

        <section aria-labelledby="tabs-heading">
          <h2 className="text-2xl font-semibold" id="tabs-heading">Tabs</h2>
          <Card className="mt-4" contentClassName="pt-0">
            <Tabs
              tabs={[
                { label: "Datos", value: "data", content: <p className="text-text-secondary">Datos principales de la paciente y su expediente.</p> },
                { label: "Contacto", value: "contact", content: <p className="text-text-secondary">Teléfono, correo y persona de contacto.</p> },
                { label: "Documentos", value: "documents", content: <p className="text-text-secondary">Archivos clínicos asociados a la ficha.</p> },
                { label: "Notas", value: "notes", content: <p className="text-text-secondary">Notas internas del equipo de atención.</p> },
              ]}
            />
          </Card>
        </section>

        <section aria-labelledby="modal-heading">
          <h2 className="text-2xl font-semibold" id="modal-heading">Modal</h2>
          <Card className="mt-4" title="Diálogo accesible">
            <p className="mb-4 text-text-secondary">Al abrirse, el foco queda dentro del diálogo. Podés cerrarlo con Escape, con el botón de cierre o haciendo clic en el fondo.</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">Abrir modal</Button>
          </Card>
          <Modal
            footer={<><Button onClick={() => setIsModalOpen(false)} variant="ghost">Cancelar</Button><Button onClick={() => setIsModalOpen(false)}>Confirmar</Button></>}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Confirmar cambio"
          >
            <p>Este contenido ilustra un diálogo con título, cuerpo y acciones de pie.</p>
          </Modal>
        </section>

        <section aria-labelledby="table-heading">
          <h2 className="text-2xl font-semibold" id="table-heading">Table</h2>
          <p className="mt-2 text-text-secondary">La paginación es visual en esta fase; todavía no hay datos ni navegación real.</p>
          <div className="mt-4">
            <Table caption="Ejemplo de pacientes" columns={tableColumns} data={patients} pagination={{ summary: "Mostrando 1–3 de 18 pacientes", currentPage: 1, totalPages: 6 }} />
          </div>
        </section>
      </div>
    </main>
  );
}