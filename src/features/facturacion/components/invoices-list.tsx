"use client";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Table, type BadgeTone } from "@/components/ui";
import {
  FacturacionApiError,
  listInvoices,
  type Invoice,
  type InvoiceStatus,
} from "../api";
const tone: Record<InvoiceStatus, BadgeTone> = {
  Pendiente: "warning",
  Pagada: "success",
  Anulada: "neutral",
};
export function InvoicesList({
  patientId,
  estado,
  canManage,
  refreshKey,
  onPay,
  onVoid,
}: {
  patientId?: string;
  estado?: InvoiceStatus;
  canManage: boolean;
  refreshKey: number;
  onPay: (invoice: Invoice) => void;
  onVoid: (invoice: Invoice) => void;
}) {
  const [items, setItems] = useState<Invoice[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await listInvoices(patientId, estado);
        if (current) setItems(result.items);
      } catch (reason) {
        if (current)
          setError(
            reason instanceof FacturacionApiError
              ? reason.message
              : "No se pudieron cargar las facturas.",
          );
      } finally {
        if (current) setLoading(false);
      }
    }
    void load();
    return () => {
      current = false;
    };
  }, [patientId, estado, refreshKey]);
  if (loading)
    return <p className="text-sm text-text-secondary">Cargando facturas...</p>;
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
          key: "numeroFactura",
          header: "Factura",
          render: (invoice) => (
            <span className="font-medium text-text">
              {invoice.numeroFactura}
            </span>
          ),
        },
        { key: "fecha", header: "Fecha", render: (invoice) => invoice.fecha },
        {
          key: "montoTotal",
          header: "Total",
          render: (invoice) => `C$ ${invoice.montoTotal.toFixed(2)}`,
        },
        {
          key: "estado",
          header: "Estado",
          render: (invoice) => (
            <Badge tone={tone[invoice.estado]}>{invoice.estado}</Badge>
          ),
        },
        {
          key: "id",
          header: "",
          render: (invoice) =>
            canManage && invoice.estado === "Pendiente" ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => onPay(invoice)}
                  size="sm"
                  variant="outline"
                >
                  Cobrar
                </Button>
                <Button
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Anular la factura ${invoice.numeroFactura}? Esta acción no se puede deshacer.`,
                      )
                    )
                      onVoid(invoice);
                  }}
                  size="sm"
                  variant="outline"
                >
                  Anular
                </Button>
              </div>
            ) : null,
        },
      ]}
      data={items}
      emptyMessage="No hay facturas para este filtro."
    />
  );
}
