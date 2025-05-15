"use client";

import {
  //Toast,
  //ToastClose,
  //ToastDescription,
  ToastProvider,
  //ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  return (
    <ToastProvider>
      {/* Puedes agregar toasts estáticos aquí si es necesario */}
      <ToastViewport />
    </ToastProvider>
  );
}