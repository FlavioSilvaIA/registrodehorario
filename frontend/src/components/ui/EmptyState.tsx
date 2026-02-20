/**
 * EmptyState - Estado vazio padronizado para listas e grids
 * UI-ENH-006
 */
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  style?: React.CSSProperties;
}

export default function EmptyState({ icon, title, description, action, style }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-10) var(--spacing-6)',
        textAlign: 'center',
        color: 'var(--gx2-texto-secundario)',
        ...style,
      }}
    >
      {icon && (
        <div style={{ marginBottom: 'var(--spacing-4)', opacity: 0.6 }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--gx2-texto)', marginBottom: 'var(--spacing-2)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 14, maxWidth: 320, marginBottom: action ? 'var(--spacing-4)' : 0 }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
