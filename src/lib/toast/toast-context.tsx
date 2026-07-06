"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Toast = { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string) => void;
};

const TOAST_DURATION_MS = 2000;

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterFrame = requestAnimationFrame(() => setVisible(true));
    const exitTimer = setTimeout(() => setVisible(false), TOAST_DURATION_MS);
    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div
      onTransitionEnd={() => {
        if (!visible) onDismiss();
      }}
      className={`rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            message={toast.message}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
