/**
 * Lista de Apontamento - Equivalente a listaapontamento.aspx
 * Filtros: Tipo, Colaborador, Mês, Ano
 * Cards: Previstas, Normal, Excedentes, Abonadas, Saldo, Exportar
 */
import { useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { SkeletonRow, EmptyState } from '../components/ui';
import Button from '../components/ui/Button';
import { formatarHorasDecimalParaHHMM } from '../utils/formatarHoras';

interface Usuario {
  usuarioId: number;
  usuarioNome: string;
  usuarioLogin: string;
}

interface Resumo {
  previstas: string;
  normal: string;
  excedentes: string;
  abonadas: string;
  saldo: string;
}

interface Apontamento {
  apontamentoId: number;
  apontamentoData: string;
  apontamentoInicioDataHora: string;
  apontamentoFinalDataHora: string;
  apontamentoHoras: number;
  apontamentoTipo: number;
  Projeto?: { projetoDescricao: string };
  ProjetoEtapaAtividade?: { projetoEtapaAtividadeNome: string };
}

const MESES = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
];

const ANOS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export default function ListaApontamentoPage() {
  useAuth();
  const [tipoFiltro, setTipoFiltro] = useState('mes');
  const [colaboradorId, setColaboradorId] = useState<string>('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([]);
  const [resumo, setResumo] = useState<Resumo>({ previstas: '0,00', normal: '0,00', excedentes: '0,00', abonadas: '0,00', saldo: '0,00' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/usuarios').then((r) => setUsuarios(r.data));
  }, []);

  const buscar = () => {
    setLoading(true);
    api.get('/apontamentos/resumo', { params: { mes, ano, colaboradorId: colaboradorId || undefined } })
      .then((r) => {
        setApontamentos(r.data.apontamentos);
        setResumo(r.data.resumo);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    buscar();
  }, []);

  const formatarHoras = (n: string | number) => formatarHorasDecimalParaHHMM(n);

  const exportarCSV = () => {
    const cols = ['Data', 'Início', 'Fim', 'Projeto', 'Atividade', 'Horas'];
    const linhas = apontamentos.map((a) => [
      new Date(a.apontamentoData).toLocaleDateString('pt-BR'),
      new Date(a.apontamentoInicioDataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      a.apontamentoFinalDataHora ? new Date(a.apontamentoFinalDataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
      a.Projeto?.projetoDescricao || '-',
      a.ProjetoEtapaAtividade?.projetoEtapaAtividadeNome || '-',
      formatarHoras(a.apontamentoHoras || 0),
    ]);
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [cols.map(escape).join(';'), ...linhas.map((r) => r.map(escape).join(';'))].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apontamentos_${mes}_${ano}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20 }}>Registro de Horas</h2>

      {/* Filtros */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        padding: 20,
        background: 'var(--gx2-branco)',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Tipo de filtro</label>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4, minWidth: 120 }}
          >
            <option value="mes">Mês</option>
            <option value="periodo">Período</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Colaborador</label>
          <select
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4, minWidth: 200 }}
          >
            <option value="">Selecione o colaborador</option>
            {usuarios.map((u) => (
              <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Mês</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4, minWidth: 140 }}
          >
            {MESES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Ano</label>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4, minWidth: 100 }}
          >
            {ANOS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <Button onClick={buscar} disabled={loading}>
            🔍 Pesquisar
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        {[
          { label: 'Previstas', value: formatarHoras(resumo.previstas), cor: 'var(--gx2-cinza-200)' },
          { label: 'Normal', value: formatarHoras(resumo.normal), cor: 'var(--gx2-cinza-200)' },
          { label: 'Excedentes', value: formatarHoras(resumo.excedentes), cor: 'var(--gx2-cinza-200)' },
          { label: 'Abonadas', value: formatarHoras(resumo.abonadas), cor: 'var(--gx2-cinza-200)' },
          { label: 'Saldo', value: formatarHoras(resumo.saldo), cor: 'var(--gx2-success)' },
          { label: 'Exportar', value: '', cor: 'var(--gx2-cinza-200)', icon: '📊', exportar: true },
        ].map((card) => (
          <div
            key={card.label}
            role={card.exportar ? 'button' : undefined}
            onClick={card.exportar ? exportarCSV : undefined}
            style={{
              padding: 16,
              background: card.cor === 'var(--gx2-success)' ? 'var(--gx2-success)' : 'var(--gx2-branco)',
              color: card.cor === 'var(--gx2-success)' ? 'var(--gx2-branco)' : 'var(--gx2-texto)',
              borderRadius: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: card.exportar ? 'pointer' : 'default',
            }}
          >
            <div style={{ fontSize: 12, marginBottom: 4, opacity: card.cor === 'var(--gx2-success)' ? 0.9 : 0.7 }}>{card.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {card.icon && <span style={{ fontSize: 24 }}>{card.icon}</span>}
              {card.value || ''}
            </div>
          </div>
        ))}
      </div>

      {/* Lista de apontamentos */}
      <div style={{ background: 'var(--gx2-branco)', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gx2-cinza-100)', borderBottom: '1px solid var(--gx2-cinza-200)' }}>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Início</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Fim</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Projeto</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Atividade</th>
              <th style={{ padding: 12, textAlign: 'right', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Horas</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
              </>
            )}
            {!loading && apontamentos.length === 0 && (
              <tr><td colSpan={6}><EmptyState icon={<FileSpreadsheet size={48} />} title="Nenhum apontamento encontrado" description="Ajuste os filtros ou registre novos apontamentos." /></td></tr>
            )}
            {!loading && apontamentos.map((a) => (
              <tr key={a.apontamentoId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                <td style={{ padding: 12 }}>{new Date(a.apontamentoData).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: 12 }}>{new Date(a.apontamentoInicioDataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: 12 }}>{a.apontamentoFinalDataHora ? new Date(a.apontamentoFinalDataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                <td style={{ padding: 12 }}>{a.Projeto?.projetoDescricao || '-'}</td>
                <td style={{ padding: 12 }}>{a.ProjetoEtapaAtividade?.projetoEtapaAtividadeNome || '-'}</td>
                <td style={{ padding: 12, textAlign: 'right' }}>{formatarHoras(a.apontamentoHoras || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
