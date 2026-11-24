"use client";
import { useState } from "react";
import { Button, Input } from "@/components/ui";
export function InventoryItemForm({
  isSubmitting,
  error,
  onCancel,
  onDirtyChange,
  onSubmit,
}: {
  isSubmitting: boolean;
  error: string;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (input: {
    nombre: string;
    categoria: string;
    unidadMedida: string;
    stockActual: number;
    stockMinimo: number;
    precioUnitario: number | null;
  }) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidad, setUnidad] = useState("unidad");
  const [actual, setActual] = useState("0");
  const [minimo, setMinimo] = useState("0");
  const [precio, setPrecio] = useState("");
  return (
    <form
      className="space-y-4"
      onChange={() => onDirtyChange?.(true)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          nombre,
          categoria,
          unidadMedida: unidad,
          stockActual: Number(actual),
          stockMinimo: Number(minimo),
          precioUnitario: precio === "" ? null : Number(precio),
        });
      }}
    >
      <Input
        label="Nombre"
        onChange={(e) => setNombre(e.target.value)}
        required
        value={nombre}
      />
      <Input
        label="Categoría"
        onChange={(e) => setCategoria(e.target.value)}
        required
        value={categoria}
      />
      <Input
        label="Unidad de medida"
        onChange={(e) => setUnidad(e.target.value)}
        required
        value={unidad}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Stock actual"
          min="0"
          onChange={(e) => setActual(e.target.value)}
          required
          type="number"
          value={actual}
        />
        <Input
          label="Stock mínimo"
          min="0"
          onChange={(e) => setMinimo(e.target.value)}
          required
          type="number"
          value={minimo}
        />
      </div>
      <Input
        label="Precio unitario (opcional)"
        min="0"
        onChange={(e) => setPrecio(e.target.value)}
        step="0.01"
        type="number"
        value={precio}
      />
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancelar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          Guardar
        </Button>
      </div>
    </form>
  );
}
export function AdjustStockForm({
  isSubmitting,
  error,
  onCancel,
  onDirtyChange,
  onSubmit,
}: {
  isSubmitting: boolean;
  error: string;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (delta: number, motivo: string) => void;
}) {
  const [delta, setDelta] = useState("");
  const [motivo, setMotivo] = useState("");
  return (
    <form
      className="space-y-4"
      onChange={() => onDirtyChange?.(true)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Number(delta), motivo);
      }}
    >
      <Input
        label="Ajuste (positivo o negativo)"
        onChange={(e) => setDelta(e.target.value)}
        required
        type="number"
        value={delta}
      />
      <Input
        label="Motivo"
        onChange={(e) => setMotivo(e.target.value)}
        required
        value={motivo}
      />
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancelar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          Registrar
        </Button>
      </div>
    </form>
  );
}
