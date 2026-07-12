import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

const VARIANT_META = {
  success: { icon: CheckCircle2, color: "text-success" },
  danger: { icon: XCircle, color: "text-danger" },
  warning: { icon: AlertTriangle, color: "text-warning" },
  info: { icon: Info, color: "text-info" },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = 4000 }) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((current) => [...current, { id, title, description, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
          >
            <AnimatePresence>
              {toasts.map((t) => {
                const meta = VARIANT_META[t.variant] || VARIANT_META.info;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="pointer-events-auto flex items-start gap-3 bg-surface-1 border border-border rounded-card shadow-pop px-4 py-3"
                  >
                    <Icon size={18} className={`${meta.color} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => dismiss(t.id)}
                      aria-label="Dismiss notification"
                      className="p-0.5 rounded-default text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Allows components to render outside the provider (tests, isolated mounts)
    return { toast: () => {}, dismiss: () => {} };
  }
  return context;
};

export default ToastProvider;
