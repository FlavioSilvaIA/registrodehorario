/**
 * Logo GX2 - Identidade Visual
 * Cores: turquesa #35b6ad, azul marinho #1b2948
 * Uso: variant="light" para fundo escuro (sidebar), variant="dark" para fundo claro (topbar)
 */
interface LogoGX2Props {
  variant?: 'light' | 'dark';
  height?: number;
  style?: React.CSSProperties;
}

export default function LogoGX2({ variant = 'dark', height = 28, style }: LogoGX2Props) {
  const fill = variant === 'light' ? 'var(--gx2-branco)' : 'var(--gx2-azul-marinho)';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 72 24"
      height={height}
      style={{ display: 'block', ...style }}
      aria-label="GX2"
    >
      <text
        x="0"
        y="18"
        fill={fill}
        fontFamily="Montserrat, sans-serif"
        fontWeight="700"
        fontSize="20"
      >
        GX2
      </text>
    </svg>
  );
}
