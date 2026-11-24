"use client";
import { useState } from "react";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import { Button, Card, Icon, Modal, PageMessage, Select, useConfirmDialog } from "@/components/ui";
import type { Patient } from "@/features/pacientes";
import {
  createPromotion,
  deletePromotion,
  discardPromotion,
  generatePromotionsNow,
  PromocionesApiError,
  PromotionForm,
  PromotionsList,
  type Promotion,
  type PromotionStatus,
} from "@/features/promociones";
import { hasPermission, useSession } from "@/stores/session";
export default function Page() {
  const { confirm } = useConfirmDialog();
  const { user } = useSession();
  const [patient, setPatient] = useState<Pick<
    Patient,
    "id" | "nombreCompleto"
  > | null>(null);
  const [estado, setEstado] = useState<PromotionStatus | "">("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const canManage = hasPermission(user, "promociones.gestionar");
  async function closeModal() {
    if (working) return;
    if (isFormDirty && !(await confirm("Tenés cambios sin guardar. Si salís ahora, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return;
    setIsModalOpen(false);
    setError("");
    setIsFormDirty(false);
  }
  async function create(input: Parameters<typeof createPromotion>[0]) {
    setWorking(true);
    setError("");
    try {
      await createPromotion(input);
      setRefreshKey((x) => x + 1);
      setIsModalOpen(false);
    } catch (reason) {
      setError(
        reason instanceof PromocionesApiError
          ? reason.message
          : "No se pudo crear la promoción.",
      );
    } finally {
      setWorking(false);
    }
  }
  async function discard(promotion: Promotion) {
    setWorking(true);
    setError("");
    try {
      await discardPromotion(promotion.id);
      setRefreshKey((x) => x + 1);
    } catch (reason) {
      setError(
        reason instanceof PromocionesApiError
          ? reason.message
          : "No se pudo descartar la promoción.",
      );
    } finally {
      setWorking(false);
    }
  }
  async function remove(promotion: Promotion) {
    setWorking(true);
    setError("");
    try {
      await deletePromotion(promotion.id);
      setRefreshKey((x) => x + 1);
    } catch (reason) {
      setError(
        reason instanceof PromocionesApiError
          ? reason.message
          : "No se pudo eliminar la promoción.",
      );
    } finally {
      setWorking(false);
    }
  }
  async function generate() {
    setWorking(true);
    setError("");
    try {
      const result = await generatePromotionsNow();
      setRefreshKey((x) => x + 1);
      setError(
        result.generated
          ? `Se generaron ${result.generated} promociones.`
          : "No había cumpleaños para generar hoy.",
      );
    } catch (reason) {
      setError(
        reason instanceof PromocionesApiError
          ? reason.message
          : "No se pudieron generar promociones.",
      );
    } finally {
      setWorking(false);
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Promociones
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Felicitaciones y ofertas generadas para pacientes.
          </p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={working}
              leadingIcon={<Icon name="plus" size={18} />}
              onClick={() => {
                setError("");
                setIsFormDirty(false);
                setIsModalOpen(true);
              }}
            >
              Nueva promoción
            </Button>
            <Button
              disabled={working}
              leadingIcon={<Icon name="sparkles" size={18} />}
              onClick={generate}
              variant="outline"
            >
              Generar ahora
            </Button>
          </div>
        ) : null}
      </div>
      {error && !isModalOpen ? <PageMessage message={error} variant={error.startsWith("Se generaron") ? "success" : "error"} /> : null}
      <Card allowOverflow title="Filtros">
        <div className="grid gap-4 sm:grid-cols-2">
          <PatientSearchPicker
            onSelect={setPatient}
            selectedPatient={patient}
          />
          <Select
            label="Estado"
            onChange={(e) => setEstado(e.target.value as PromotionStatus | "")}
            options={[
              { label: "Todos", value: "" },
              { label: "Generada", value: "Generada" },
              { label: "Enviada", value: "Enviada" },
              { label: "Descartada", value: "Descartada" },
            ]}
            value={estado}
          />
        </div>
      </Card>
      <PromotionsList
        canManage={canManage}
        estado={estado || undefined}
        onDelete={remove}
        onDiscard={discard}
        patientId={patient?.id}
        refreshKey={refreshKey}
      />
      <Modal isOpen={isModalOpen} onClose={() => void closeModal()} title="Nueva promoción">
        <PromotionForm
          isSubmitting={working}
          key={isModalOpen ? "new" : "closed"}
          onCancel={() => void closeModal()}
          onDirtyChange={setIsFormDirty}
          onSubmit={create}
          submitError={error}
        />
      </Modal>
    </div>
  );
}
