/**
 * Card - Componente de container GX2
 * GX2-ENH-004
 */
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        padding: 'var(--spacing-5)',
        background: 'var(--gx2-branco)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
