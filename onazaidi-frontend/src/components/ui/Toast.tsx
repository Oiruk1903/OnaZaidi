import { create } from "zustand";
import { X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (kind: ToastKind, message: string) => void;
  remove: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (kind, message) => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { id, kind, message }] });
    setTimeout(() => get().remove(id), 4000);
  },
  remove: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  error: (message: string) => useToastStore.getState().push("error", message),
  info: (message: string) => useToastStore.getState().push("info", message),
};

export function ToastHost() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex min-w-[280px] max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg ${
            t.kind === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : t.kind === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-gray-200 bg-white text-gray-800"
          }`}
        >
          <span className="flex-1 text-sm">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-current/60 hover:text-current"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
