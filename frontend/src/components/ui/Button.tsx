/**
 * Button - Componente GX2 com variantes
 * GX2-ENH-002
 */
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'cancel';
type Size = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--gx2-turquesa)', color: 'var(--gx2-branco)', border: 'none' },
  secondary: { background: 'var(--gx2-turquesa-claro)', color: 'var(--gx2-azul-marinho)', border: 'none' },
  ghost: { background: 'transparent', color: 'var(--gx2-azul-marinho)', border: '1px solid var(--gx2-cinza-300)' },
  danger: { background: 'var(--gx2-danger)', color: 'var(--gx2-branco)', border: 'none' },
  success: { background: 'var(--gx2-success)', color: 'var(--gx2-branco)', border: 'none' },
  cancel: { background: 'var(--gx2-danger)', color: 'var(--gx2-branco)', border: 'none' },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '4px 12px', fontSize: 13 },
  md: { padding: '8px 16px', fontSize: 14 },
  lg: { padding: '12px 24px', fontSize: 16 },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'inherit',
  };
  const className = `gx2-btn gx2-btn-${variant}`;
  return (
    <button
      className={className}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
