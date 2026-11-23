"use client";
import { useState } from "react";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import { Button, Card, Icon, Modal, Select } from "@/components/ui";
import type { Patient } from "@/features/pacientes";
import {
  createInvoice,
  FacturacionApiError,
  InvoiceForm,
  InvoicesList,
  MarkPaidForm,
  markInvoicePaid,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
  voidInvoice,
} from "@/features/facturacion";
import { useSession } from "@/stores/session";
export default function Page() {
  const { user } = useSession();
  const [patient, setPatient] = useState<Pick<
    Patient,
    "id" | "nombreCompleto"
  > | null>(null);
  const [estado, setEstado] = useState<InvoiceStatus | "">("");
  const [mode, setMode] = useState<"new" | "pay" | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const canManage = user?.role === "Admin" || user?.role === "Recepcionista";
  function close() {
    if (!submitting) {
      setMode(null);
      setError("");
    }
  }
  async function create(items: InvoiceItem[]) {
    if (!patient) return;
    setSubmitting(true);
    setError("");
    try {
      await createInvoice({
        patientId: patient.id,
        appointmentId: null,
        items,
      });
      setRefreshKey((value) => value + 1);
      setMode(null);
    } catch (reason) {
      setError(
        reason instanceof FacturacionApiError
          ? reason.message
          : "No se pudo crear la factura.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function pay(method: string) {
    if (!invoice) return;
    setSubmitting(true);
    setError("");
    try {
      await markInvoicePaid(invoice.id, method);
      setRefreshKey((value) => value + 1);
      setMode(null);
    } catch (reason) {
      setError(
        reason instanceof FacturacionApiError
          ? reason.message
          : "No se pudo registrar el pago.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function handleVoid(selectedInvoice: Invoice) {
    await voidInvoice(selectedInvoice.id);
    setRefreshKey((value) => value + 1);
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Facturación
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Generá facturas y registrá sus cobros.
          </p>
        </div>
        {patient && canManage ? (
          <Button
            leadingIcon={<Icon name="plus" size={18} />}
            onClick={() => setMode("new")}
          >
            Nueva factura
          </Button>
        ) : null}
      </div>
      <Card allowOverflow title="Filtros">
        <div className="grid gap-4 sm:grid-cols-2">
          <PatientSearchPicker
            onSelect={setPatient}
            selectedPatient={patient}
          />
          <Select
            label="Estado"
            onChange={(event) =>
              setEstado(event.target.value as InvoiceStatus | "")
            }
            options={[
              { label: "Todos", value: "" },
              { label: "Pendiente", value: "Pendiente" },
              { label: "Pagada", value: "Pagada" },
              { label: "Anulada", value: "Anulada" },
            ]}
            value={estado}
          />
        </div>
      </Card>
      <InvoicesList
        canManage={canManage}
        estado={estado || undefined}
        onPay={(value) => {
          setInvoice(value);
          setError("");
          setMode("pay");
        }}
        onVoid={(value) => void handleVoid(value)}
        patientId={patient?.id}
        refreshKey={refreshKey}
      />
      <Modal isOpen={mode === "new"} onClose={close} title="Nueva factura">
        <InvoiceForm
          isSubmitting={submitting}
          onCancel={close}
          onSubmit={create}
          submitError={error}
        />
      </Modal>
      <Modal isOpen={mode === "pay"} onClose={close} title="Registrar pago">
        <MarkPaidForm
          isSubmitting={submitting}
          onCancel={close}
          onSubmit={pay}
          submitError={error}
        />
      </Modal>
    </div>
  );
}
