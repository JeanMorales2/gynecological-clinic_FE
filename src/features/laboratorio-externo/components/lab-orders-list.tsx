"use client";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Table, type BadgeTone } from "@/components/ui";
import {
  LabOrdersApiError,
  listLabOrders,
  type LabOrder,
  type LabOrderStatus,
} from "../api";
const tone: Record<LabOrderStatus, BadgeTone> = {
  Solicitado: "warning",
  Recibido: "success",
  Cancelado: "neutral",
};
export function LabOrdersList({
  patientId,
  canManage,
  refreshKey,
  onReceive,
  onCancel,
}: {
  patientId: string;
  canManage: boolean;
  refreshKey: number;
  onReceive: (order: LabOrder) => void;
  onCancel: (order: LabOrder) => void;
}) {
  const [items, setItems] = useState<LabOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await listLabOrders(patientId);
        if (current) setItems(result.items);
      } catch (reason) {
        if (current)
          setError(
            reason instanceof LabOrdersApiError
              ? reason.message
              : "No se pudieron cargar las órdenes.",
          );
      } finally {
        if (current) setLoading(false);
      }
    }
    void load();
    return () => {
      current = false;
    };
  }, [patientId, refreshKey]);
  if (loading)
    return <p className="text-sm text-text-secondary">Cargando órdenes...</p>;
  if (error)
    return (
      <Card>
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      </Card>
    );
  return (
    <Table
      columns={[
        {
          key: "tipoEstudio",
          header: "Estudio",
          render: (order) => (
            <div>
              <p className="font-medium text-text">{order.tipoEstudio}</p>
              <p className="text-xs text-text-secondary">
                {order.laboratorioNombre}
              </p>
            </div>
          ),
        },
        {
          key: "fechaSolicitud",
          header: "Solicitud",
          render: (order) => order.fechaSolicitud,
        },
        {
          key: "estado",
          header: "Estado",
          render: (order) => (
            <Badge tone={tone[order.estado]}>{order.estado}</Badge>
          ),
        },
        {
          key: "id",
          header: "",
          render: (order) =>
            canManage && order.estado === "Solicitado" ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => onReceive(order)}
                  size="sm"
                  variant="outline"
                >
                  Cargar resultado
                </Button>
                <Button
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Cancelar la orden de ${order.tipoEstudio}? Esta acción no se puede deshacer.`,
                      )
                    )
                      onCancel(order);
                  }}
                  size="sm"
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            ) : null,
        },
      ]}
      data={items}
      emptyMessage="No hay órdenes de laboratorio para este paciente."
    />
  );
}
