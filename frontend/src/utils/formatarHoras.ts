/**
 * Utilitários de formatação de horas - conceito e máscara GeneXus
 * FormatarHoraDecimalParaStringHHMM: horas decimais (8.5) → HH:MM (08:30)
 */

/**
 * Converte horas decimais para string no formato HH:MM.
 * Ex: 8.5 → "08:30", 0 → "00:00"
 * Baseado em FormatarHoraDecimalParaStringHHMM do GeneXus.
 */
export function formatarHorasDecimalParaHHMM(decimal: number | string | null | undefined): string {
  const n = typeof decimal === 'string' ? Number(String(decimal).replace(',', '.')) : Number(decimal);
  if (Number.isNaN(n) || n < 0) return '00:00';
  let horas = Math.floor(n);
  let minutos = Math.round((n - horas) * 60);
  if (minutos >= 60) {
    horas += 1;
    minutos = 0;
  }
  const h = String(horas).padStart(2, '0');
  const m = String(Math.min(59, Math.max(0, minutos))).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Converte string HH:MM ou HH:MM:SS para horas decimais.
 * Ex: "08:30" → 8.5, "08:30:00" → 8.5
 */
export function parseHHMMParaDecimal(hhmm: string | null | undefined): number {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const parts = hhmm.trim().split(/[:\s]+/);
  const h = parseInt(parts[0] || '0', 10) || 0;
  const m = parseInt(parts[1] || '0', 10) || 0;
  const s = parseInt(parts[2] || '0', 10) || 0;
  return h + m / 60 + s / 3600;
}
