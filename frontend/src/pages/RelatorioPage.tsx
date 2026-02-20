/**
 * Relatório - Uma página por relatório, acessível pelo menu à esquerda
 */
import { useEffect, useState, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { formatarHorasDecimalParaHHMM, parseHHMMParaDecimal } from '../utils/formatarHoras';

const TIPOS_VALIDOS = ['horas-profissional', 'importar', 'colaborador', 'horarios-consolidados', 'fechamento-reembolso', 'previa', 'projeto', 'projeto-centro-custo'] as const;
type TipoRelatorio = typeof TIPOS_VALIDOS[number];

const MESES = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
];

const ANOS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const inputStyle = { padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 'var(--radius-sm)', minWidth: 180 };
const btnStyle = { padding: '8px 16px', background: 'var(--gx2-success)', color: 'var(--gx2-branco)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' };
const btnSecStyle = { ...btnStyle, background: 'var(--gx2-branco)', color: 'var(--gx2-texto)', border: '1px solid var(--gx2-cinza-300)' };

const COLS_IMPORT = ['Data', 'Início', 'Fim', 'UsuarioLogin', 'ProjetoId', 'AtividadeId', 'Horas', 'Comentário'];

function formatDateBR(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return y && m && day ? `${day}/${m}/${y}` : d;
}

export default function RelatorioPage() {
  const toast = useToast();
  const { tipo: tipoParam } = useParams<{ tipo?: string }>();
  const tipo: TipoRelatorio = tipoParam && TIPOS_VALIDOS.includes(tipoParam as TipoRelatorio) ? (tipoParam as TipoRelatorio) : 'colaborador';

  if (!tipoParam) return <Navigate to="/relatorio/colaborador" replace />;

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [colaboradorId, setColaboradorId] = useState<string>('');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);

  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ criados: number; total: number; erros: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtros comuns
  const [empresaId, setEmpresaId] = useState('');
  const [equipeId, setEquipeId] = useState('');
  const [projetoId, setProjetoId] = useState('');
  const [colabId, setColabId] = useState('');
  const getDefaultDataInicial = () => {
    const d = new Date();
    const y = d.getFullYear(), m = d.getMonth();
    return `${y}-${String(m + 1).padStart(2, '0')}-01`;
  };
  const getDefaultDataFinal = () => {
    const d = new Date();
    const y = d.getFullYear(), m = d.getMonth();
    const ultimo = new Date(y, m + 1, 0).getDate();
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`;
  };
  const [dataInicial, setDataInicial] = useState(getDefaultDataInicial);
  const [dataFinal, setDataFinal] = useState(getDefaultDataFinal);
  const [aplicarRegra75, setAplicarRegra75] = useState(false);
  const [tipoPeriodo, setTipoPeriodo] = useState('periodo');
  const [tipoPrevia, setTipoPrevia] = useState('empresa-usuario');

  useEffect(() => {
    api.get('/usuarios', { params: { todos: 1 } }).then((r) => setUsuarios(r.data || []));
    api.get('/empresas').then((r) => setEmpresas(r.data || []));
    api.get('/equipes').then((r) => setEquipes(r.data || []));
    api.get('/projetos', { params: { todos: 1 } }).then((r) => setProjetos(r.data || []));
  }, []);

  useEffect(() => {
    if (!empresaId) {
      setUsuariosFiltrados(usuarios);
      return;
    }
    const params: Record<string, string> = { todos: '1', empresa: empresaId };
    if (equipeId) params.equipe = equipeId;
    api.get('/usuarios', { params }).then((r) => setUsuariosFiltrados(r.data || []));
  }, [empresaId, equipeId, usuarios]);

  useEffect(() => {
    if (tipo !== 'previa') return;
    const hoje = new Date();
    const y = hoje.getFullYear(), m = hoje.getMonth();
    if (tipoPeriodo === 'mes') {
      setDataInicial(`${y}-${String(m + 1).padStart(2, '0')}-01`);
      setDataFinal(`${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`);
    } else if (tipoPeriodo === 'ano') {
      setDataInicial(`${y}-01-01`);
      setDataFinal(`${y}-12-31`);
    } else if (tipoPeriodo === 'semana') {
      const dia = hoje.getDay();
      const diff = dia === 0 ? -6 : 1 - dia;
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() + diff);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 6);
      setDataInicial(`${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}`);
      setDataFinal(`${fim.getFullYear()}-${String(fim.getMonth() + 1).padStart(2, '0')}-${String(fim.getDate()).padStart(2, '0')}`);
    }
  }, [tipo, tipoPeriodo]);

  const gerarHorasProfissional = () => {
    setLoading(true);
    api.get('/relatorios/horas-profissional', { params: { mes, ano, colaboradorId: colaboradorId || undefined } })
      .then((r) => setDados(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const gerarRelatorio = (endpoint: string, params: Record<string, string | number | boolean | undefined>) => {
    const p: Record<string, string> = {};
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) p[k] = String(v); });
    setLoading(true);
    api.get(`/relatorios/${endpoint}`, { params: p })
      .then((r) => setDados(r.data))
      .catch((e) => { toast.error(e.response?.data?.error || 'Erro ao gerar relatório'); setDados(null); })
      .finally(() => setLoading(false));
  };

  const gerarExcel = (dadosRel: any[], nomeArquivo: string, cols?: string[]) => {
    if (!dadosRel || dadosRel.length === 0) {
      toast.error('Nenhum dado para exportar.');
      return;
    }
    try {
      const keys = cols || Object.keys(dadosRel[0]);
      const rows = [keys.map((k) => k.replace(/([A-Z])/g, ' $1').trim()), ...dadosRel.map((r) => keys.map((k) => (r as any)[k] ?? ''))];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
      XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar Excel. Verifique o console.');
    }
  };

  const gerarPDFColaborador = (rel: { empresaNome: string; dataInicial: string; dataFinal: string; colaboradores: any[] }) => {
    if (!rel?.colaboradores?.length) { toast.error('Nenhum dado para exportar.'); return; }
    try {
    const doc = new jsPDF();
    const f = (n: number) => formatarHorasDecimalParaHHMM(n);
    const col = rel.colaboradores;
    for (let i = 0; i < col.length; i++) {
      if (i > 0) doc.addPage();
      const c = col[i];
      doc.setFontSize(16);
      doc.text('Relatório Colaborador', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Empresa: ${rel.empresaNome}`, 14, 30);
      doc.text(`${formatDateBR(rel.dataInicial)} à ${formatDateBR(rel.dataFinal)}`, 14, 37);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 42, 196, 42);
      doc.setFontSize(12);
      doc.text(c.usuarioNome, 14, 52);
      doc.setFontSize(10);
      doc.text(`Equipe: ${c.equipeNome || '-'}`, 14, 60);
      doc.text(`Previstas: ${f(c.previstas)} | Realizadas: ${f(c.realizadas)} | Horas Extras: ${f(c.horasExtras)} | Abonadas: ${f(c.abonadas)} | Saldo: ${f(c.saldo)}`, 14, 68);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 72, 196, 72);
      let y = 80;
      const lancs = c.lancamentos || [];
      for (const l of lancs) {
        doc.text(l.data ? formatDateBR(String(l.data).slice(0, 10)) : '', 105, y, { align: 'center' });
        y += 6;
        doc.text(`${l.horaInicio || ''} - ${l.horaFim || ''} ${l.observacao || ''}`, 14, y);
        y += 8;
        if (y > 270) { y = 20; doc.addPage(); }
      }
    }
    doc.save('relatorio_colaborador.pdf');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF. Verifique o console.');
    }
  };

  const gerarExcelColaborador = (rel: { empresaNome: string; dataInicial: string; dataFinal: string; colaboradores: any[] }) => {
    if (!rel?.colaboradores?.length) { toast.error('Nenhum dado para exportar.'); return; }
    try {
    const rows: any[][] = [['Empresa', 'Período', 'Colaborador', 'Equipe', 'Previstas', 'Realizadas', 'Horas Extras', 'Abonadas', 'Saldo', 'Data', 'Hora Início', 'Hora Fim', 'Observação']];
    const per = `${formatDateBR(rel.dataInicial)} à ${formatDateBR(rel.dataFinal)}`;
    for (const c of rel.colaboradores) {
      const f = (n: number) => formatarHorasDecimalParaHHMM(n);
      const lancs = c.lancamentos || [];
      if (lancs.length === 0) {
        rows.push([rel.empresaNome, per, c.usuarioNome, c.equipeNome || '', f(c.previstas), f(c.realizadas), f(c.horasExtras), f(c.abonadas), f(c.saldo), '', '', '', '']);
      } else {
        lancs.forEach((l: any, idx: number) => {
          rows.push([
            idx === 0 ? rel.empresaNome : '',
            idx === 0 ? per : '',
            idx === 0 ? c.usuarioNome : '',
            idx === 0 ? (c.equipeNome || '') : '',
            idx === 0 ? f(c.previstas) : '',
            idx === 0 ? f(c.realizadas) : '',
            idx === 0 ? f(c.horasExtras) : '',
            idx === 0 ? f(c.abonadas) : '',
            idx === 0 ? f(c.saldo) : '',
            l.data ? formatDateBR(String(l.data).slice(0, 10)) : '',
            l.horaInicio || '',
            l.horaFim || '',
            l.observacao || '',
          ]);
        });
      }
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Colaborador');
    XLSX.writeFile(wb, 'relatorio_colaborador.xlsx');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar Excel. Verifique o console.');
    }
  };

  const gerarPDFHorariosConsolidados = (rel: { dataInicial: string; dataFinal: string; linhas: any[] }) => {
    if (!rel?.linhas?.length) { toast.error('Nenhum dado para exportar.'); return; }
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const fHora = (n: number) => formatarHorasDecimalParaHHMM(n);
      const fValor = (n: number) => Number(n).toFixed(2).replace('.', ',');
      doc.setFontSize(14);
      doc.text('Relatório Horários Consolidados', 148, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`${formatDateBR(rel.dataInicial)} à ${formatDateBR(rel.dataFinal)}`, 148, 22, { align: 'center' });
      doc.setFontSize(8);
      const cols = ['Chamado', 'Início', 'Fim', 'Total', 'Horas Normais', 'H.E. 50%', 'H.E. 75%', 'H.E. 100%', 'Valor Hora', 'V50%', 'V75%', 'V100%'];
      const colWidths = [40, 25, 25, 15, 18, 15, 15, 15, 18, 15, 15, 15];
      let x = 14, y = 30;
      cols.forEach((c, i) => { doc.text(c, x, y); x += colWidths[i]; });
      y += 6; x = 14;
      for (const l of rel.linhas) {
        doc.text(String(l.chamado || '').slice(0, 25), x, y); x += 40;
        doc.text(String(l.inicio || '').slice(0, 12), x, y); x += 25;
        doc.text(String(l.fim || '').slice(0, 12), x, y); x += 25;
        doc.text(fHora(l.total), x, y); x += 15;
        doc.text(fHora(l.horasNormais), x, y); x += 18;
        doc.text(fHora(l.horaExtra50), x, y); x += 15;
        doc.text(fHora(l.horaExtra75), x, y); x += 15;
        doc.text(fHora(l.horaExtra100), x, y); x += 15;
        doc.text(fValor(l.valorHora), x, y); x += 18;
        doc.text(fValor(l.v50), x, y); x += 15;
        doc.text(fValor(l.v75), x, y); x += 15;
        doc.text(fValor(l.v100), x, y);
        y += 5; x = 14;
        if (y > 190) { y = 15; (doc as any).addPage('l'); }
      }
      doc.save('horarios_consolidados.pdf');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF. Verifique o console.');
    }
  };

  const baixarTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      COLS_IMPORT,
      ['18/02/2026', '08:00', '12:00', 'colab01', '1', '1', '4', 'Exemplo'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Importação');
    XLSX.writeFile(wb, 'template_importacao_apontamentos.xlsx');
  };

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) return reject(new Error('Arquivo vazio'));
          const ext = file.name.toLowerCase().split('.').pop();
          let rows: any[][] = [];
          if (ext === 'csv') {
            const text = (typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer)).replace(/^\ufeff/, '');
            const sep = text.includes(';') ? ';' : ',';
            rows = text.split(/\r?\n/).map((row) => row.split(sep).map((c) => c.replace(/^"|"$/g, '').trim()));
          } else {
            const wb = XLSX.read(data, { type: ext === 'xlsx' || ext === 'xls' ? 'array' : 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          }
          const header = rows[0]?.map((h: any) => String(h || '').trim()) || [];
          const dataIdx = header.findIndex((h: string) => /data/i.test(h));
          const inicioIdx = header.findIndex((h: string) => /in[ií]cio/i.test(h));
          const fimIdx = header.findIndex((h: string) => /fim/i.test(h));
          const loginIdx = header.findIndex((h: string) => /usuario|login/i.test(h));
          const projIdx = header.findIndex((h: string) => /projeto/i.test(h));
          const ativIdx = header.findIndex((h: string) => /atividade/i.test(h));
          const horasIdx = header.findIndex((h: string) => /hora/i.test(h));
          const comentIdx = header.findIndex((h: string) => /coment/i.test(h));

          const linhas = rows.slice(1).filter((r) => r.some((c: any) => c != null && String(c).trim())).map((r) => r.map((c: any) => String(c ?? '').trim())).map((r) => ({
            data: (dataIdx >= 0 ? r[dataIdx] : '') || '',
            inicio: (inicioIdx >= 0 ? r[inicioIdx] : '') || '',
            fim: (fimIdx >= 0 ? r[fimIdx] : '') || '',
            usuarioLogin: (loginIdx >= 0 ? r[loginIdx] : '') || '',
            projetoId: projIdx >= 0 && r[projIdx] ? Number(r[projIdx]) || undefined : undefined,
            atividadeId: ativIdx >= 0 && r[ativIdx] ? Number(r[ativIdx]) || undefined : undefined,
            horas: horasIdx >= 0 && r[horasIdx] ? (() => { const v = String(r[horasIdx]).trim(); if (/^\d{1,2}:\d{2}/.test(v)) return parseHHMMParaDecimal(v); return Number(v.replace(',', '.')) || undefined; })() : undefined,
            comentario: comentIdx >= 0 ? r[comentIdx] || undefined : undefined,
          }));
          resolve(linhas);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      if (file.name.toLowerCase().endsWith('.csv')) reader.readAsText(file, 'UTF-8');
      else reader.readAsArrayBuffer(file);
    });
  };

  const importar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setImportResult(null);
    try {
      const linhas = await parseFile(file);
      const r = await api.post('/apontamentos/importar', { linhas });
      setImportResult(r.data);
    } catch (err) {
      toast.error('Erro ao importar. Verifique o formato do arquivo.');
      console.error(err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const defaultDataInicial = getDefaultDataInicial();
  const defaultDataFinal = getDefaultDataFinal();

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20 }}>Relatório{tipo !== 'horas-profissional' ? ` — ${tipo === 'importar' ? 'Importar Excel/CSV' : tipo === 'colaborador' ? 'Colaborador' : tipo === 'horarios-consolidados' ? 'Horários Consolidados' : tipo === 'fechamento-reembolso' ? 'Fechamento de Reembolso' : tipo === 'previa' ? 'Prévia' : tipo === 'projeto' ? 'Projeto' : 'Projeto/Centro de Custo'}` : ''}</h2>

      {tipo === 'horas-profissional' && (
        <>
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Mês</label>
                <select value={mes} onChange={(e) => setMes(Number(e.target.value))} style={inputStyle}>
                  {MESES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Ano</label>
                <select value={ano} onChange={(e) => setAno(Number(e.target.value))} style={inputStyle}>
                  {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Colaborador</label>
                <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} style={inputStyle}>
                  <option value="">Todos</option>
                  {usuarios.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
                </select>
              </div>
              <Button onClick={gerarHorasProfissional} disabled={loading}>Pesquisar</Button>
              <Button variant="ghost" onClick={async () => { setLoading(true); try { const r = await api.get('/relatorios/horas-profissional', { params: { mes, ano, colaboradorId: colaboradorId || undefined } }); if (r.data?.profissionais?.length) gerarExcel(r.data.profissionais.map((p: any) => ({ Colaborador: p.usuarioNome, Login: p.usuarioLogin, 'Total horas': formatarHorasDecimalParaHHMM(p.totalHoras), 'Qtd. apontamentos': p.quantidade })), 'horas_profissional'); else toast.error('Nenhum dado para exportar.'); } catch (e) { toast.error('Erro ao gerar Excel.'); } finally { setLoading(false); } }} disabled={loading} style={{ background: 'var(--gx2-branco)', color: 'var(--gx2-texto)', border: '1px solid var(--gx2-cinza-300)' }}>Gerar Excel</Button>
            </div>
          </Card>
          {dados && (
            <div >
              <h3 style={{ marginBottom: 16 }}>Resultado — {MESES.find((m) => m.value === dados.mes)?.label} {dados.ano}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                    <th style={{ padding: 12, textAlign: 'left' }}>Colaborador</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Login</th>
                    <th style={{ padding: 12, textAlign: 'right' }}>Total horas</th>
                    <th style={{ padding: 12, textAlign: 'right' }}>Qtd. apontamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.profissionais?.map((p: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                      <td style={{ padding: 12 }}>{p.usuarioNome}</td>
                      <td style={{ padding: 12 }}>{p.usuarioLogin}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>{formatarHorasDecimalParaHHMM(p.totalHoras)}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>{p.quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!dados.profissionais || dados.profissionais.length === 0) && <p style={{ padding: 24, textAlign: 'center', color: 'var(--gx2-cinza-500)' }}>Nenhum dado encontrado</p>}
            </div>
          )}
        </>
      )}

      {tipo === 'colaborador' && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>*Empresa</label>
              <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} style={{ ...inputStyle, minWidth: 200 }} required>
                <option value="">Selecione</option>
                {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>Equipe</label>
              <select value={equipeId} onChange={(e) => setEquipeId(e.target.value)} style={{ ...inputStyle, minWidth: 200 }}>
                <option value="">Selecione</option>
                {equipes.filter((eq) => !empresaId || eq.equipeEmpresaId == empresaId).map((eq) => <option key={eq.equipeId} value={eq.equipeId}>{eq.equipeDescricao}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>Colaborador</label>
              <select value={colabId} onChange={(e) => setColabId(e.target.value)} style={{ ...inputStyle, minWidth: 200 }}>
                <option value="">Selecione</option>
                {usuariosFiltrados.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>*Data Inicial</label>
              <input type="date" value={dataInicial || defaultDataInicial} onChange={(e) => setDataInicial(e.target.value || defaultDataInicial)} style={{ ...inputStyle, minWidth: 200 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>*Data Final</label>
              <input type="date" value={dataFinal || defaultDataFinal} onChange={(e) => setDataFinal(e.target.value || defaultDataFinal)} style={{ ...inputStyle, minWidth: 200 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ minWidth: 120 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" id="regra75" checked={aplicarRegra75} onChange={(e) => setAplicarRegra75(e.target.checked)} />
                Aplicar regra de 75%
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => gerarRelatorio('colaborador', { empresaId, equipeId: equipeId || undefined, colaboradorId: colabId || undefined, dataInicial: dataInicial || defaultDataInicial, dataFinal: dataFinal || defaultDataFinal, aplicarRegra75 })} disabled={loading || !empresaId} style={btnStyle}>Pesquisar</button>
            <button onClick={async () => { if (!empresaId) { toast.error('Selecione a Empresa.'); return; } const di = dataInicial || defaultDataInicial; const df = dataFinal || defaultDataFinal; setLoading(true); try { const r = await api.get('/relatorios/colaborador', { params: { empresaId, equipeId: equipeId || undefined, colaboradorId: colabId || undefined, dataInicial: di, dataFinal: df, aplicarRegra75 } }); if (r.data?.colaboradores?.length) { gerarPDFColaborador(r.data); setTimeout(() => gerarExcelColaborador(r.data), 500); } else toast.error('Nenhum dado para exportar.'); } catch (e: unknown) { toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao gerar.'); } finally { setLoading(false); } }} disabled={loading || !empresaId} style={btnSecStyle}>Gerar PDF e Excel</button>
          </div>
          {dados?.colaboradores && dados.colaboradores.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--gx2-texto-secundario)' }}>Empresa: {dados.empresaNome} | Período: {formatDateBR(dados.dataInicial)} à {formatDateBR(dados.dataFinal)}</div>
              {dados.colaboradores.map((c: any, i: number) => (
                <div key={i} style={{ marginBottom: 24, padding: 16, border: '1px solid var(--gx2-cinza-200)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{c.usuarioNome}</div>
                  <div style={{ fontSize: 14, color: 'var(--gx2-texto-secundario)', marginBottom: 8 }}>Equipe: {c.equipeNome || '-'}</div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12, fontSize: 14 }}>
                    <span>Previstas: {formatarHorasDecimalParaHHMM(c.previstas)}</span>
                    <span>Realizadas: {formatarHorasDecimalParaHHMM(c.realizadas)}</span>
                    <span>Horas Extras: {formatarHorasDecimalParaHHMM(c.horasExtras)}</span>
                    <span>Abonadas: {formatarHorasDecimalParaHHMM(c.abonadas)}</span>
                    <span>Saldo: {formatarHorasDecimalParaHHMM(c.saldo)}</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}><th style={{ padding: 8, textAlign: 'left' }}>Data</th><th style={{ padding: 8, textAlign: 'left' }}>Início</th><th style={{ padding: 8, textAlign: 'left' }}>Fim</th><th style={{ padding: 8, textAlign: 'left' }}>Observação</th></tr></thead>
                    <tbody>{(c.lancamentos || []).map((l: any, j: number) => <tr key={j} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}><td style={{ padding: 8 }}>{formatDateBR(String(l.data || '').slice(0, 10))}</td><td style={{ padding: 8 }}>{l.horaInicio}</td><td style={{ padding: 8 }}>{l.horaFim}</td><td style={{ padding: 8 }}>{l.observacao}</td></tr>)}</tbody>
                  </table>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => gerarPDFColaborador(dados)} style={btnSecStyle}>Gerar PDF</button>
                <button onClick={() => gerarExcelColaborador(dados)} style={btnSecStyle}>Gerar Excel</button>
              </div>
            </div>
          )}
        </Card>
      )}

      {tipo === 'horarios-consolidados' && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>*Empresa</label>
              <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} style={{ ...inputStyle, minWidth: 200 }} required>
                <option value="">Selecione</option>
                {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>Equipe</label>
              <select value={equipeId} onChange={(e) => setEquipeId(e.target.value)} style={{ ...inputStyle, minWidth: 200 }}>
                <option value="">Selecione</option>
                {equipes.filter((eq) => !empresaId || eq.equipeEmpresaId == empresaId).map((eq) => <option key={eq.equipeId} value={eq.equipeId}>{eq.equipeDescricao}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>Colaborador</label>
              <select value={colabId} onChange={(e) => setColabId(e.target.value)} style={{ ...inputStyle, minWidth: 200 }}>
                <option value="">Selecione</option>
                {usuariosFiltrados.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>*Data Inicial</label>
              <input type="date" value={dataInicial || defaultDataInicial} onChange={(e) => setDataInicial(e.target.value || defaultDataInicial)} style={{ ...inputStyle, minWidth: 200 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ minWidth: 120, fontSize: 14, color: 'var(--gx2-texto)' }}>*Data Final</label>
              <input type="date" value={dataFinal || defaultDataFinal} onChange={(e) => setDataFinal(e.target.value || defaultDataFinal)} style={{ ...inputStyle, minWidth: 200 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ minWidth: 120 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" id="regra75hc" checked={aplicarRegra75} onChange={(e) => setAplicarRegra75(e.target.checked)} />
                Aplicar regra de 75%
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => gerarRelatorio('horarios-consolidados', { empresaId, equipeId: equipeId || undefined, colaboradorId: colabId || undefined, dataInicial: dataInicial || defaultDataInicial, dataFinal: dataFinal || defaultDataFinal, aplicarRegra75 })} disabled={loading} style={btnStyle}>Pesquisar</button>
            <button onClick={async () => { const di = dataInicial || defaultDataInicial; const df = dataFinal || defaultDataFinal; setLoading(true); try { const r = await api.get('/relatorios/horarios-consolidados', { params: { empresaId, equipeId: equipeId || undefined, colaboradorId: colabId || undefined, dataInicial: di, dataFinal: df, aplicarRegra75 } }); if (r.data?.linhas?.length) gerarExcel(r.data.linhas.map((l: any) => ({ Chamado: l.chamado, Início: l.inicio, Fim: l.fim, Total: formatarHorasDecimalParaHHMM(l.total), 'Horas Normais': formatarHorasDecimalParaHHMM(l.horasNormais), 'Hora Extra 50%': formatarHorasDecimalParaHHMM(l.horaExtra50), 'Hora Extra 75%': formatarHorasDecimalParaHHMM(l.horaExtra75), 'Hora Extra 100%': formatarHorasDecimalParaHHMM(l.horaExtra100), 'Valor Hora': Number(l.valorHora).toFixed(2).replace('.', ','), 'V50%': Number(l.v50).toFixed(2).replace('.', ','), 'V75%': Number(l.v75).toFixed(2).replace('.', ','), 'V100%': Number(l.v100).toFixed(2).replace('.', ',') })), 'horarios_consolidados'); else toast.error('Nenhum dado para exportar.'); } catch (e) { toast.error('Erro ao gerar Excel.'); } finally { setLoading(false); } }} disabled={loading} style={btnSecStyle}>Gerar Excel</button>
          </div>
          {dados?.linhas && dados.linhas.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--gx2-success)' }}>
                <thead>
                  <tr style={{ background: 'var(--gx2-azul-marinho)', color: 'var(--gx2-branco)' }}>
                    <th style={{ padding: 10, textAlign: 'left' }}>Chamado</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Início</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Fim</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>Total</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>Horas Normais</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>Hora Extra 50%</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>Hora Extra 75%</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>Hora Extra 100%</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>Valor Hora</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>V50%</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>V75%</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>V100%</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.linhas.map((l: any, i: number) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'var(--gx2-cinza-100)' : 'var(--gx2-branco)', borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                      <td style={{ padding: 10 }}>{l.chamado}</td>
                      <td style={{ padding: 10 }}>{l.inicio}</td>
                      <td style={{ padding: 10 }}>{l.fim}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{formatarHorasDecimalParaHHMM(l.total)}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{formatarHorasDecimalParaHHMM(l.horasNormais)}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{formatarHorasDecimalParaHHMM(l.horaExtra50)}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{formatarHorasDecimalParaHHMM(l.horaExtra75)}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{formatarHorasDecimalParaHHMM(l.horaExtra100)}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{Number(l.valorHora).toFixed(2).replace('.', ',')}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{Number(l.v50).toFixed(2).replace('.', ',')}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{Number(l.v75).toFixed(2).replace('.', ',')}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>{Number(l.v100).toFixed(2).replace('.', ',')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => gerarPDFHorariosConsolidados(dados)} style={btnSecStyle}>Gerar PDF</button>
                <button onClick={() => gerarExcel(dados.linhas.map((l: any) => ({ Chamado: l.chamado, Início: l.inicio, Fim: l.fim, Total: l.total, 'Horas Normais': l.horasNormais, 'Hora Extra 50%': l.horaExtra50, 'Hora Extra 75%': l.horaExtra75, 'Hora Extra 100%': l.horaExtra100, 'Valor Hora': l.valorHora, 'V50%': l.v50, 'V75%': l.v75, 'V100%': l.v100 })), 'horarios_consolidados')} style={btnSecStyle}>Gerar Excel</button>
              </div>
            </div>
          )}
        </Card>
      )}

      {tipo === 'fechamento-reembolso' && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Fechamento de Reembolso</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>*Empresa</label>
              <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} style={inputStyle} required>
                <option value="">Selecione</option>
                {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>*Data Inicial</label>
              <input type="date" value={dataInicial || defaultDataInicial} onChange={(e) => setDataInicial(e.target.value || defaultDataInicial)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>*Data Final</label>
              <input type="date" value={dataFinal || defaultDataFinal} onChange={(e) => setDataFinal(e.target.value || defaultDataFinal)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => gerarRelatorio('fechamento-reembolso', { empresaId, dataInicial: dataInicial || defaultDataInicial, dataFinal: dataFinal || defaultDataFinal })} disabled={loading} style={btnStyle}>Pesquisar</button>
            <button onClick={async () => { setLoading(true); try { const r = await api.get('/relatorios/fechamento-reembolso', { params: { empresaId, dataInicial: dataInicial || defaultDataInicial, dataFinal: dataFinal || defaultDataFinal } }); if (r.data?.dados?.length) gerarExcel(r.data.dados, 'fechamento_reembolso'); else toast.error('Nenhum dado para exportar.'); } catch (e) { toast.error('Erro ao gerar Excel.'); } finally { setLoading(false); } }} disabled={loading} style={btnSecStyle}>Gerar Excel</button>
          </div>
          {dados?.dados && (
            <div style={{ marginTop: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}><th style={{ padding: 12, textAlign: 'left' }}>Colaborador</th><th style={{ padding: 12, textAlign: 'left' }}>Data</th><th style={{ padding: 12, textAlign: 'right' }}>Valor</th><th style={{ padding: 12 }}>Situação</th></tr></thead>
                <tbody>{dados.dados.map((r: any, i: number) => <tr key={i} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}><td style={{ padding: 12 }}>{r.usuarioNome}</td><td style={{ padding: 12 }}>{formatDateBR(String(r.reembolsoData || '').slice(0, 10))}</td><td style={{ padding: 12, textAlign: 'right' }}>{r.reembolsoValor}</td><td style={{ padding: 12 }}>{r.reembolsoSituacao === 1 ? 'Pendente' : r.reembolsoSituacao === 2 ? 'Aprovado' : 'Negado'}</td></tr>)}</tbody>
              </table>
              <button onClick={() => gerarExcel(dados.dados, 'fechamento_reembolso')} style={{ marginTop: 12, ...btnSecStyle }}>Gerar Excel</button>
            </div>
          )}
        </Card>
      )}

      {tipo === 'previa' && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Prévia</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Tipo período</label>
              <select value={tipoPeriodo} onChange={(e) => setTipoPeriodo(e.target.value)} style={inputStyle}>
                <option value="periodo">Período</option>
                <option value="mes">Mês</option>
                <option value="ano">Ano</option>
                <option value="semana">Semana</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Empresa</label>
              <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} style={inputStyle}>
                <option value="">Selecione a Empresa</option>
                {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data inicial</label>
              <input type="date" value={dataInicial || defaultDataInicial} onChange={(e) => setDataInicial(e.target.value || defaultDataInicial)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data final</label>
              <input type="date" value={dataFinal || defaultDataFinal} onChange={(e) => setDataFinal(e.target.value || defaultDataFinal)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Tipo</label>
              <select value={tipoPrevia} onChange={(e) => setTipoPrevia(e.target.value)} style={inputStyle}>
                <option value="empresa-usuario">Empresa/Usuário</option>
                <option value="empresa-projeto">Empresa/Projeto</option>
                <option value="projeto-usuario">Projeto/Usuário</option>
                <option value="por-colaborador">Por Colaborador</option>
                <option value="por-projeto">Por Projeto</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => gerarRelatorio('previa', { tipoPeriodo, empresaId: empresaId || undefined, dataInicial: dataInicial || defaultDataInicial, dataFinal: dataFinal || defaultDataFinal, tipo: tipoPrevia })} disabled={loading} style={btnStyle}>Pesquisar</button>
            <button onClick={async () => { setLoading(true); try { const r = await api.get('/relatorios/previa', { params: { tipoPeriodo, empresaId: empresaId || undefined, dataInicial: dataInicial || defaultDataInicial, dataFinal: dataFinal || defaultDataFinal, tipo: tipoPrevia } }); if (r.data?.dados?.length) gerarExcel(r.data.dados, 'previa'); else toast.error('Nenhum dado para exportar.'); } catch (e) { toast.error('Erro ao gerar Excel.'); } finally { setLoading(false); } }} disabled={loading} style={btnSecStyle}>Gerar Excel</button>
          </div>
          {dados?.dados && (
            <div style={{ marginTop: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}><th style={{ padding: 12, textAlign: 'left' }}>Colaborador</th><th style={{ padding: 12, textAlign: 'left' }}>Projeto</th><th style={{ padding: 12, textAlign: 'left' }}>Data</th><th style={{ padding: 12, textAlign: 'right' }}>Horas</th></tr></thead>
                <tbody>{dados.dados.map((r: any, i: number) => <tr key={i} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}><td style={{ padding: 12 }}>{r.usuarioNome}</td><td style={{ padding: 12 }}>{r.projetoDescricao}</td><td style={{ padding: 12 }}>{formatDateBR(String(r.apontamentoData || '').slice(0, 10))}</td><td style={{ padding: 12, textAlign: 'right' }}>{formatarHorasDecimalParaHHMM(r.apontamentoHoras)}</td></tr>)}</tbody>
              </table>
              <button onClick={() => gerarExcel(dados.dados, 'previa')} style={{ marginTop: 12, ...btnSecStyle }}>Gerar Excel</button>
            </div>
          )}
        </Card>
      )}

      {(tipo === 'projeto' || tipo === 'projeto-centro-custo') && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>{tipo === 'projeto' ? 'Relatório Projeto' : 'Projeto/Centro de Custo'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>*Empresa</label>
              <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} style={inputStyle} required>
                <option value="">Selecione</option>
                {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Projeto</label>
              <select value={projetoId} onChange={(e) => setProjetoId(e.target.value)} style={inputStyle}>
                <option value="">Selecione</option>
                {projetos.filter((p) => !empresaId || p.projetoEmpresaId == empresaId).map((p) => <option key={p.projetoId} value={p.projetoId}>{p.projetoDescricao}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Equipe</label>
              <select value={equipeId} onChange={(e) => setEquipeId(e.target.value)} style={inputStyle}>
                <option value="">Selecione</option>
                {equipes.filter((eq) => !empresaId || eq.equipeEmpresaId == empresaId).map((eq) => <option key={eq.equipeId} value={eq.equipeId}>{eq.equipeDescricao}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Colaborador</label>
              <select value={colabId} onChange={(e) => setColabId(e.target.value)} style={inputStyle}>
                <option value="">Selecione</option>
                {usuariosFiltrados.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>*Data Inicial</label>
              <input type="date" value={dataInicial || defaultDataInicial} onChange={(e) => setDataInicial(e.target.value || defaultDataInicial)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>*Data Final</label>
              <input type="date" value={dataFinal || defaultDataFinal} onChange={(e) => setDataFinal(e.target.value || defaultDataFinal)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => gerarRelatorio(tipo === 'projeto' ? 'projeto' : 'projeto-centro-custo', { empresaId, projetoId: projetoId || undefined, equipeId: equipeId || undefined, colaboradorId: colabId || undefined, dataInicial: dataInicial || defaultDataInicial, dataFinal: dataFinal || defaultDataFinal })} disabled={loading} style={btnStyle}>Pesquisar</button>
            <button onClick={async () => { setLoading(true); try { const r = await api.get(`/relatorios/${tipo === 'projeto' ? 'projeto' : 'projeto-centro-custo'}`, { params: { empresaId, projetoId: projetoId || undefined, equipeId: equipeId || undefined, colaboradorId: colabId || undefined, dataInicial: dataInicial || defaultDataInicial, dataFinal: dataFinal || defaultDataFinal } }); if (r.data?.dados?.length) gerarExcel(r.data.dados, `relatorio_${tipo}`); else toast.error('Nenhum dado para exportar.'); } catch (e) { toast.error('Erro ao gerar Excel.'); } finally { setLoading(false); } }} disabled={loading} style={btnSecStyle}>Gerar Excel</button>
          </div>
          {dados?.dados && (
            <div style={{ marginTop: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                    <th style={{ padding: 12, textAlign: 'left' }}>Projeto</th>
                    {tipo === 'projeto-centro-custo' && <th style={{ padding: 12, textAlign: 'left' }}>Centro de Custo</th>}
                    <th style={{ padding: 12, textAlign: 'left' }}>Colaborador</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Data</th>
                    <th style={{ padding: 12, textAlign: 'right' }}>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.dados.map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                      <td style={{ padding: 12 }}>{r.projetoDescricao}</td>
                      {tipo === 'projeto-centro-custo' && <td style={{ padding: 12 }}>{r.centroCustoDescricao}</td>}
                      <td style={{ padding: 12 }}>{r.usuarioNome}</td>
                      <td style={{ padding: 12 }}>{formatDateBR(String(r.apontamentoData || '').slice(0, 10))}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>{formatarHorasDecimalParaHHMM(r.apontamentoHoras)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => gerarExcel(dados.dados, `relatorio_${tipo}`)} style={{ marginTop: 12, ...btnSecStyle }}>Gerar Excel</button>
            </div>
          )}
        </Card>
      )}

      {tipo === 'importar' && (
        <Card>
          <h3 style={{ marginBottom: 16 }}>Importar apontamentos de Excel ou CSV</h3>
          <p style={{ marginBottom: 16, color: 'var(--gx2-texto-secundario)', fontSize: 14 }}>
            Campos obrigatórios: <strong>Data</strong>, <strong>Início</strong>, <strong>Fim</strong>, <strong>UsuarioLogin</strong>.<br />
            Opcionais: ProjetoId, AtividadeId, Horas, Comentário. Formato Data: dd/mm/aaaa. Horas: HH:mm.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <button onClick={baixarTemplate} style={{ padding: '10px 20px', background: 'var(--gx2-turquesa)', color: 'var(--gx2-branco)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>📥 Baixar template Excel</button>
            <div>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={importar} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={loading} style={{ padding: '10px 20px', background: 'var(--gx2-success)', color: 'var(--gx2-branco)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>📤 Selecionar arquivo para importar</button>
            </div>
          </div>
          {importResult && (
            <div style={{ marginTop: 20, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6, border: '1px solid var(--gx2-success)' }}>
              <strong>Importação concluída:</strong> {importResult.criados} de {importResult.total} registros importados.
              {importResult.erros?.length > 0 && (
                <div style={{ marginTop: 16, fontSize: 13, color: 'var(--gx2-danger)' }}>
                  <strong>Erros:</strong>
                  <ul style={{ margin: '8px 0 0 20px' }}>{importResult.erros.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
