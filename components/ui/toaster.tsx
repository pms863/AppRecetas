"use client";

import {
  //Toast,
  //ToastClose,
  //ToastDescription,
  ToastProvider,
  //ToastTitle,
  ToastViewport,
} from "../ui/toast";

export function Toaster() {
  return (
    <ToastProvider>
      {/* Puedes agregar toasts estáticos aquí si es necesario */}
      <ToastViewport />
    </ToastProvider>
  );
}