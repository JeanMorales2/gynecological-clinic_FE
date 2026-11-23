"use client";
import { useState } from "react";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import { Button, Card, Icon, Modal } from "@/components/ui";
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
import { useSession } from "@/stores/session";
export default function Page() {
  const { user } = useSession();
  const [patient, setPatient] = useState<Pick<
    Patient,
    "id" | "nombreCompleto"
  > | null>(null);
  const [mode, setMode] = useState<"new" | "receive" | "attachments" | null>(null);
  const [order, setOrder] = useState<LabOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const canManage = user?.role === "Admin" || user?.role === "Ginecologa";
  function close() {
    if (!submitting) {
      setMode(null);
      setError("");
    }
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
    await cancelLabOrder(selectedOrder.id);
    setRefreshKey((value) => value + 1);
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
            onClick={() => setMode("new")}
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
              setMode("receive");
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
      <Modal
        isOpen={mode === "new"}
        onClose={close}
        title="Nueva orden de laboratorio"
      >
        <LabOrderForm
          isSubmitting={submitting}
          onCancel={close}
          onSubmit={create}
          submitError={error}
        />
      </Modal>
      <Modal
        isOpen={mode === "attachments"}
        onClose={close}
        title={`Adjuntos${order ? `: ${order.tipoEstudio}` : ""}`}
      >
        {order ? <LabOrderAttachments canManage={canManage} labOrderId={order.id} /> : null}
      </Modal>
      <Modal
        isOpen={mode === "receive"}
        onClose={close}
        title="Cargar resultado de laboratorio"
      >
        <ReceiveLabResultForm
          isSubmitting={submitting}
          onCancel={close}
          onSubmit={receive}
          submitError={error}
        />
      </Modal>
    </div>
  );
}
