"use client";

import { useEffect, useState } from "react";
import { Button, Card, Icon, Input, Modal, PageMessage, Select, useConfirmDialog } from "@/components/ui";
import { useDebounce } from "@/hooks/use-debounce";
import {
  convertProspect,
  createProspect,
  inviteProspect,
  listProspects,
  ProspectoForm,
  ProspectosApiError,
  ProspectosTable,
  ConvertirProspectoForm,
  updateProspect,
  type ConvertProspectInput,
  type NewProspectInput,
  type PagedProspects,
  type Prospect,
  type ProspectInput,
  type ProspectStatus,
} from "@/features/prospeccion";

const pageSize = 10;
const emptyResult: PagedProspects = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize,
};
const stateFilterOptions = [
  { label: "Todos los estados", value: "" },
  { label: "Nuevo", value: "Nuevo" },
  { label: "Contactado", value: "Contactado" },
  { label: "Agendado", value: "Agendado" },
  { label: "Convertido", value: "Convertido" },
  { label: "Perdido", value: "Perdido" },
];

export default function Page() {
  const { confirm } = useConfirmDialog();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [estadoFilter, setEstadoFilter] = useState<ProspectStatus | "">("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PagedProspects>(emptyResult);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [convertingProspect, setConvertingProspect] = useState<Prospect | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isProspectFormDirty, setIsProspectFormDirty] = useState(false);
  const [isConvertFormDirty, setIsConvertFormDirty] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function loadProspects() {
      setIsLoading(true);
      setLoadError("");
      try {
        const prospects = await listProspects({
          search: debouncedSearch,
          estado: estadoFilter || undefined,
          page,
          pageSize,
        });
        if (isCurrent) setResult(prospects);
      } catch (reason) {
        if (isCurrent)
          setLoadError(
            reason instanceof ProspectosApiError
              ? reason.message
              : "No se pudo cargar la lista de prospectos.",
          );
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    void loadProspects();
    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, estadoFilter, page, refreshKey]);

  function reload() {
    setRefreshKey((current) => current + 1);
  }
  function openNewProspectModal() {
    setEditingProspect(null);
    setFormError("");
    setIsProspectFormDirty(false);
    setIsProspectModalOpen(true);
  }
  function openEditProspectModal(prospect: Prospect) {
    setEditingProspect(prospect);
    setFormError("");
    setIsProspectFormDirty(false);
    setIsProspectModalOpen(true);
  }
  function openConvertModal(prospect: Prospect) {
    setConvertingProspect(prospect);
    setFormError("");
    setIsConvertFormDirty(false);
    setIsConvertModalOpen(true);
  }
  async function closeProspectModal() {
    if (isSubmitting) return;
    if (isProspectFormDirty && !(await confirm("Tenés cambios sin guardar. Si salís ahora, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return;
    setIsProspectModalOpen(false);
    setFormError("");
    setIsProspectFormDirty(false);
  }
  async function closeConvertModal() {
    if (isSubmitting) return;
    if (isConvertFormDirty && !(await confirm("Tenés cambios sin guardar. Si salís ahora, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return;
    setIsConvertModalOpen(false);
    setFormError("");
    setIsConvertFormDirty(false);
  }

  async function handleProspectSubmit(
    values: NewProspectInput | ProspectInput,
  ) {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingProspect) {
        if (!("estado" in values)) return;
        await updateProspect(editingProspect.id, values);
      } else {
        await createProspect(values);
      }
      setIsProspectModalOpen(false);
      setPage(1);
      reload();
    } catch (reason) {
      setFormError(
        reason instanceof ProspectosApiError
          ? reason.message
          : "No se pudo guardar el prospecto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConvert(values: ConvertProspectInput) {
    if (!convertingProspect) return;
    setIsSubmitting(true);
    setFormError("");
    try {
      await convertProspect(convertingProspect.id, values);
      setIsConvertModalOpen(false);
      setConvertingProspect(null);
      reload();
    } catch (reason) {
      setFormError(
        reason instanceof ProspectosApiError
          ? reason.message
          : "No se pudo convertir el prospecto en paciente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleInvite(prospect: Prospect) {
    setInviteMessage("");
    try {
      const result = await inviteProspect(prospect.id);
      setInviteMessage(
        result.emailEnviado
          ? "El correo de invitación se envió correctamente."
          : `No se pudo enviar el correo de invitación${result.errorEnvio ? `: ${result.errorEnvio}` : "."}`,
      );
      reload();
    } catch (reason) {
      setInviteMessage(
        reason instanceof ProspectosApiError
          ? reason.message
          : "No se pudo procesar la invitación por correo.",
      );
    }
  }

  const totalPages = Math.max(1, Math.ceil(result.totalCount / pageSize));
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Prospección
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Seguimiento de personas antes de convertirse en pacientes.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-xl">
          <Input
            label="Buscar prospectos"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre"
            value={search}
          />
          <Select
            label="Filtrar por estado"
            onChange={(event) => {
              setEstadoFilter(event.target.value as ProspectStatus | "");
              setPage(1);
            }}
            options={stateFilterOptions}
            value={estadoFilter}
          />
        </div>
        <Button
          leadingIcon={<Icon name="plus" size={18} />}
          onClick={openNewProspectModal}
        >
          Nuevo prospecto
        </Button>
      </div>
      {inviteMessage ? <PageMessage message={inviteMessage} variant={inviteMessage.startsWith("El correo") ? "success" : "error"} /> : null}
      {loadError ? (
        <><PageMessage message={loadError} /><Card>
          <div className="space-y-3">
            <Button onClick={reload} variant="outline">
              Reintentar
            </Button>
          </div>
        </Card></>
      ) : null}
      {!loadError ? (
        isLoading ? (
          <p className="text-sm text-text-secondary" role="status">
            Cargando prospectos...
          </p>
        ) : (
          <ProspectosTable
            onConvert={openConvertModal}
            onEdit={openEditProspectModal}
            onInvite={(prospect) => void handleInvite(prospect)}
            onNextPage={() =>
              setPage((current) => Math.min(current + 1, totalPages))
            }
            onPreviousPage={() =>
              setPage((current) => Math.max(current - 1, 1))
            }
            page={result.page}
            pageSize={result.pageSize}
            prospects={result.items}
            totalCount={result.totalCount}
          />
        )
      ) : null}
      <Modal
        isOpen={isProspectModalOpen}
        onClose={() => void closeProspectModal()}
        title={editingProspect ? "Editar prospecto" : "Nuevo prospecto"}
      >
        <ProspectoForm
          isSubmitting={isSubmitting}
          key={editingProspect?.id ?? "new"}
          onCancel={() => void closeProspectModal()}
          onDirtyChange={setIsProspectFormDirty}
          onSubmit={handleProspectSubmit}
          prospect={editingProspect}
          submitError={formError}
        />
      </Modal>
      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => void closeConvertModal()}
        title="Convertir a paciente"
      >
        {convertingProspect ? (
          <ConvertirProspectoForm
            isSubmitting={isSubmitting}
            key={convertingProspect.id}
            onCancel={() => void closeConvertModal()}
            onDirtyChange={setIsConvertFormDirty}
            onSubmit={handleConvert}
            prospect={convertingProspect}
            submitError={formError}
          />
        ) : null}
      </Modal>
    </div>
  );
}
