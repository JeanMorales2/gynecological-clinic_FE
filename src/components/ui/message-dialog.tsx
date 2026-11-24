"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "./icon";
import { Modal } from "./modal";

type MessageVariant = "success" | "error";
type MessageState = { variant: MessageVariant; title: string; message: string };
type ConfirmOptions = { confirmLabel?: string; danger?: boolean };

type DialogContextValue = {
  showMessage: (variant: MessageVariant, message: string, title?: string) => void;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<MessageState | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; options: ConfirmOptions } | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const closeConfirmation = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setConfirmation(null);
  }, []);

  const showMessage = useCallback((variant: MessageVariant, text: string, title?: string) => {
      setMessage({ variant, message: text, title: title ?? (variant === "success" ? "Listo" : "Ocurrió un problema") });
  }, []);
  const confirm = useCallback((text: string, options: ConfirmOptions = {}) => {
      resolver.current?.(false);
      return new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setConfirmation({ message: text, options });
      });
  }, []);
  const value = useMemo<DialogContextValue>(() => ({ showMessage, confirm }), [confirm, showMessage]);

  return <DialogContext.Provider value={value}>
    {children}
    <Modal
      isOpen={message !== null}
      onClose={() => setMessage(null)}
      overlayClassName="z-[60]"
      title={message?.title ?? ""}
      footer={<Button onClick={() => setMessage(null)}>Entendido</Button>}
    >
      {message ? <div className="flex items-start gap-3"><Icon className={message.variant === "success" ? "text-success" : "text-danger"} name={message.variant === "success" ? "check" : "alert"} size={24} /><p>{message.message}</p></div> : null}
    </Modal>
    <Modal
      isOpen={confirmation !== null}
      onClose={() => closeConfirmation(false)}
      overlayClassName="z-[60]"
      title="Confirmar acción"
      footer={<><Button onClick={() => closeConfirmation(false)} variant="outline">Cancelar</Button><Button onClick={() => closeConfirmation(true)} variant={confirmation?.options.danger ? "danger" : "primary"}>{confirmation?.options.confirmLabel ?? "Confirmar"}</Button></>}
    >
      <p>{confirmation?.message}</p>
    </Modal>
  </DialogContext.Provider>;
}

function useDialogs() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useMessageDialog y useConfirmDialog deben usarse dentro de DialogProvider.");
  return context;
}

export function useMessageDialog() { return useDialogs(); }
export function useConfirmDialog() { return useDialogs(); }

export function PageMessage({ message, variant = "error" }: { message: string; variant?: MessageVariant }) {
  const { showMessage } = useMessageDialog();
  useEffect(() => { if (message) showMessage(variant, message); }, [message, showMessage, variant]);
  return null;
}
