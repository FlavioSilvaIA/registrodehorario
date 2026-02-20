/**
 * Toast - Feedback de ações (substitui alert())
 * UI-ENH-007
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const variantConfig: Record<ToastVariant, { bg: string; border: string; icon: React.ElementType; color: string }> = {
  success: { bg: 'var(--gx2-success-bg)', border: 'var(--gx2-success)', icon: CheckCircle, color: 'var(--gx2-success)' },
  error: { bg: 'var(--gx2-danger-bg)', border: 'var(--gx2-danger)', icon: AlertCircle, color: 'var(--gx2-danger)' },
  info: { bg: 'var(--gx2-cinza-100)', border: 'var(--gx2-turquesa)', icon: Info, color: 'var(--gx2-turquesa)' },
};

function ToastItemComponent({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const config = variantConfig[item.variant];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
        padding: 'var(--spacing-3) var(--spacing-4)',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: 14,
        color: 'var(--gx2-texto)',
        minWidth: 280,
        maxWidth: 400,
      }}
    >
      <Icon size={20} style={{ flexShrink: 0, color: config.color }} />
      <span style={{ flex: 1 }}>{item.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          color: 'var(--gx2-texto-secundario)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => remove(id), 5000);
  }, [remove]);

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 'var(--spacing-4)',
          right: 'var(--spacing-4)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-2)',
        }}
      >
        {toasts.map((t) => (
          <ToastItemComponent key={t.id} item={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
