/**
 * Alert - Mensagens de erro, sucesso, info e aviso
 * UI-ENH-008
 */
import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

const variantConfig: Record<AlertVariant, { bg: string; border: string; icon: React.ElementType; color: string }> = {
  error: { bg: 'var(--gx2-danger-bg)', border: 'var(--gx2-danger)', icon: AlertCircle, color: 'var(--gx2-danger)' },
  success: { bg: 'var(--gx2-success-bg)', border: 'var(--gx2-success)', icon: CheckCircle, color: 'var(--gx2-success)' },
  info: { bg: 'var(--gx2-cinza-100)', border: 'var(--gx2-turquesa)', icon: Info, color: 'var(--gx2-turquesa)' },
  warning: { bg: 'var(--gx2-warning-bg)', border: 'var(--gx2-warning)', icon: AlertTriangle, color: 'var(--gx2-warning)' },
};

export default function Alert({ variant, title, children, onDismiss, style }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--spacing-3)',
        padding: 'var(--spacing-4)',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        fontSize: 14,
        color: 'var(--gx2-texto)',
        ...style,
      }}
    >
      <Icon size={20} style={{ flexShrink: 0, color: config.color, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        {title && (
          <strong style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}>{title}</strong>
        )}
        {children}
      </div>
      {onDismiss && (
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
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
