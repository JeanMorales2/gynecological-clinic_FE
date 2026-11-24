"use client";
import { useState } from "react";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import { Button, Card, Icon, Modal, PageMessage, useConfirmDialog } from "@/components/ui";
import type { Patient } from "@/features/pacientes";
import {
  cancelLabOrder,
  createLabOrder,
  LabOrderForm,
  LabOrderAttachments,
  LabOrdersApiError,
  LabOrdersList,
  ReceiveLabResultForm,
  receiveLabResult,
  type LabOrder,
  type LabOrderFormValues,
} from "@/features/laboratorio-externo";
import { hasPermission, useSession } from "@/stores/session";
export default function Page() {
  const { confirm } = useConfirmDialog();
  const { user } = useSession();
  const [patient, setPatient] = useState<Pick<
    Patient,
    "id" | "nombreCompleto"
  > | null>(null);
  const [mode, setMode] = useState<"new" | "receive" | "attachments" | null>(null);
  const [order, setOrder] = useState<LabOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const canManage = hasPermission(user, "laboratorio.gestionar");
  async function close() {
    if (submitting) return;
    if ((mode === "new" || mode === "receive") && isFormDirty && !(await confirm("Tenés cambios sin guardar. Si salís ahora, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return;
    setMode(null);
    setError("");
    setIsFormDirty(false);
  }
  async function create(values: LabOrderFormValues) {
    if (!patient) return;
    setSubmitting(true);
    setError("");
    try {
      await createLabOrder({ ...values, patientId: patient.id });
      setRefreshKey((value) => value + 1);
      setMode(null);
    } catch (reason) {
      setError(
        reason instanceof LabOrdersApiError
          ? reason.message
          : "No se pudo crear la orden.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function receive(values: {
    resultadoResumen: string;
    observaciones: string | null;
  }) {
    if (!order) return;
    setSubmitting(true);
    setError("");
    try {
      await receiveLabResult(order.id, values);
      setRefreshKey((value) => value + 1);
      setMode(null);
    } catch (reason) {
      setError(
        reason instanceof LabOrdersApiError
          ? reason.message
          : "No se pudo registrar el resultado.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function handleCancel(selectedOrder: LabOrder) {
    setError("");
    try { await cancelLabOrder(selectedOrder.id); setRefreshKey((value) => value + 1); }
    catch (reason) { setError(reason instanceof LabOrdersApiError ? reason.message : "No se pudo cancelar la orden."); }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Laboratorio externo
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Registrá solicitudes y resultados de estudios externos.
          </p>
        </div>
        {patient && canManage ? (
          <Button
            leadingIcon={<Icon name="plus" size={18} />}
            onClick={() => { setIsFormDirty(false); setMode("new"); }}
          >
            Nueva orden
          </Button>
        ) : null}
      </div>
      <Card allowOverflow title="Buscar paciente">
        <PatientSearchPicker onSelect={setPatient} selectedPatient={patient} />
      </Card>
      {!patient ? (
        <Card>
          <p className="text-sm text-text-secondary">
            Elegí un paciente para consultar sus órdenes de laboratorio.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Órdenes de{" "}
            <span className="font-semibold text-text">
              {patient.nombreCompleto}
            </span>
          </p>
          <LabOrdersList
            canManage={canManage}
            onCancel={(value) => void handleCancel(value)}
            onReceive={(value) => {
              setOrder(value);
              setError("");
              setIsFormDirty(false); setMode("receive");
            }}
            onAttachments={(value) => {
              setOrder(value);
              setError("");
              setMode("attachments");
            }}
            patientId={patient.id}
            refreshKey={refreshKey}
          />
        </div>
      )}
      {mode === null ? <PageMessage message={error} /> : null}
      <Modal
        isOpen={mode === "new"}
        onClose={() => void close()}
        title="Nueva orden de laboratorio"
      >
        <div onChange={() => setIsFormDirty(true)}><LabOrderForm
          isSubmitting={submitting}
          onCancel={() => void close()}
          onSubmit={create}
          submitError={error}
        /></div>
      </Modal>
      <Modal
        isOpen={mode === "attachments"}
        onClose={() => void close()}
        title={`Adjuntos${order ? `: ${order.tipoEstudio}` : ""}`}
      >
        {order ? <LabOrderAttachments canManage={canManage} labOrderId={order.id} /> : null}
      </Modal>
      <Modal
        isOpen={mode === "receive"}
        onClose={() => void close()}
        title="Cargar resultado de laboratorio"
      >
        <div onChange={() => setIsFormDirty(true)}><ReceiveLabResultForm
          isSubmitting={submitting}
          onCancel={() => void close()}
          onSubmit={receive}
          submitError={error}
        /></div>
      </Modal>
    </div>
  );
}
