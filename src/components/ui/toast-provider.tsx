// src\components/ui/toast-provider.tsx
"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      visibleToasts={1}
      expand={false}
      toastOptions={{
        duration: 1500,
        className:
          "bg-background/80 backdrop-blur-xl border border-border/50 text-foreground shadow-2xl rounded-2xl",
      }}
    />
  );
}
