/**
 * Skeleton - Loading placeholder para listas e cards
 * UI-ENH-005
 */
import { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
  className?: string;
}

export default function Skeleton({ width, height = 20, borderRadius = 'var(--radius-sm)', style, className }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width: width ?? '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        background: 'linear-gradient(90deg, var(--gx2-cinza-200) 25%, var(--gx2-cinza-100) 50%, var(--gx2-cinza-200) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
      aria-hidden
    />
  );
}

/** Skeleton para linha de tabela */
export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: 'var(--spacing-3)' }}>
          <Skeleton height={16} width={i === cols - 1 ? 60 : undefined} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton para card */
export function SkeletonCard() {
  return (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--gx2-branco)', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Skeleton height={24} width="60%" style={{ marginBottom: 'var(--spacing-3)' }} />
      <Skeleton height={16} style={{ marginBottom: 'var(--spacing-2)' }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: 'var(--spacing-2)' }} />
      <Skeleton height={16} width="40%" />
    </div>
  );
}
