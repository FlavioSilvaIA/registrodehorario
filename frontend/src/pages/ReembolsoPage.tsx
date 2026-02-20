/**
 * Reembolso - Listagem e aprovação
 * Equivalente a tela de reembolso do sistema original GeneXus
 */
import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';

const SITUACAO: Record<number, string> = { 1: 'Pendente', 2: 'Aprovado', 3: 'Negado' };

const inputStyle = { padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 'var(--radius-sm)' };
const acoesCellStyle = { display: 'flex', flexDirection: 'row' as const, gap: 8, padding: 12, alignItems: 'center', justifyContent: 'flex-end' };

export default function ReembolsoPage() {
  const toast = useToast();
  const [reembolsos, setReembolsos] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroDataDe, setFiltroDataDe] = useState('');
  const [filtroDataAte, setFiltroDataAte] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [editandoReembolso, setEditandoReembolso] = useState(false);
  const [form, setForm] = useState({
    reembolsoData: new Date().toISOString().split('T')[0],
    tipoId: '',
    reembolsoDataNota: '',
    reembolsoValor: '',
    reembolsoObservacao: '',
    reembolsoNotaFiscalBase64: '',
    reembolsoNotaFiscalNome: '',
  });
  const fileNotaRef = useRef<HTMLInputElement>(null);

  const carregar = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filtroNome) params.nome = filtroNome;
    if (filtroDataDe) params.dataDe = filtroDataDe;
    if (filtroDataAte) params.dataAte = filtroDataAte;
    if (filtroSituacao) params.situacao = filtroSituacao;
    Promise.all([
      api.get('/reembolsos/tipos').then((r) => setTipos(r.data)),
      api.get('/reembolsos', { params }).then((r) => setReembolsos(r.data)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const aprovar = (id: number) => {
    if (!confirm('Aprovar este reembolso?')) return;
    api.post(`/reembolsos/${id}/aprovar`).then(() => { carregar(); toast.success('Aprovado.'); }).catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const negar = (id: number) => {
    if (!confirm('Negar este reembolso?')) return;
    api.post(`/reembolsos/${id}/negar`).then(() => { carregar(); toast.success('Negado.'); }).catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const abrirNovo = () => {
    setEditandoReembolso(true);
    setForm({
      reembolsoData: new Date().toISOString().split('T')[0],
      tipoId: '',
      reembolsoDataNota: '',
      reembolsoValor: '',
      reembolsoObservacao: '',
      reembolsoNotaFiscalBase64: '',
      reembolsoNotaFiscalNome: '',
    });
  };

  const enviar = () => {
    if (!form.tipoId || !form.reembolsoValor) {
      toast.error('Preencha tipo de reembolso e valor.');
      return;
    }
    api.post('/reembolsos', {
      reembolsoTipoReembolsoId: Number(form.tipoId),
      reembolsoValor: Number(String(form.reembolsoValor).replace(',', '.')),
      reembolsoData: form.reembolsoData,
      reembolsoDataNota: form.reembolsoDataNota || undefined,
      reembolsoObservacao: form.reembolsoObservacao || undefined,
      reembolsoNotaFiscalBase64: form.reembolsoNotaFiscalBase64 || undefined,
      reembolsoNotaFiscalNome: form.reembolsoNotaFiscalNome || undefined,
    }).then(() => {
      setEditandoReembolso(false);
      carregar();
      toast.success('Reembolso enviado.');
    }).catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20 }}>Reembolso</h2>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3>Reembolsos</h3>
          <Button type="button" onClick={abrirNovo}>+ Novo</Button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Nome</label>
            <input type="text" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} placeholder="Filtrar por nome" style={{ ...inputStyle, minWidth: 160 }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data da solicitação de</label>
            <input type="date" value={filtroDataDe} onChange={(e) => setFiltroDataDe(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data até</label>
            <input type="date" value={filtroDataAte} onChange={(e) => setFiltroDataAte(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Situação</label>
            <select value={filtroSituacao} onChange={(e) => setFiltroSituacao(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
              <option value="">Todas</option>
              <option value="1">Pendente</option>
              <option value="2">Aprovado</option>
              <option value="3">Negado</option>
            </select>
          </div>
          <Button type="button" onClick={carregar}>Filtrar</Button>
        </div>
        {editandoReembolso && (
          <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
            <h4 style={{ marginBottom: 12, fontSize: 14 }}>Novo reembolso</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 600 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data da solicitação</label>
                <input type="date" value={form.reembolsoData} onChange={(e) => setForm({ ...form, reembolsoData: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Tipo de reembolso</label>
                <select value={form.tipoId} onChange={(e) => setForm({ ...form, tipoId: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                  <option value="">— Selecione —</option>
                  {tipos.map((t) => <option key={t.tipoReembolsoId} value={t.tipoReembolsoId}>{t.tipoReembolsoDescricao}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data da nota</label>
                <input type="date" value={form.reembolsoDataNota} onChange={(e) => setForm({ ...form, reembolsoDataNota: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Valor a ser reembolsado (R$)</label>
                <input type="number" step="0.01" value={form.reembolsoValor} onChange={(e) => setForm({ ...form, reembolsoValor: e.target.value })} placeholder="0,00" style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Observação</label>
                <textarea value={form.reembolsoObservacao} onChange={(e) => setForm({ ...form, reembolsoObservacao: e.target.value })} rows={3} style={{ ...inputStyle, width: '100%', minHeight: 80 }} placeholder="Opcional" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Nota fiscal</label>
                <input ref={fileNotaRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = () => setForm({ ...form, reembolsoNotaFiscalBase64: (r.result as string)?.split(',')[1], reembolsoNotaFiscalNome: f.name });
                    r.readAsDataURL(f);
                  }
                }} />
                <Button type="button" variant="secondary" size="sm" onClick={() => fileNotaRef.current?.click()}>Carregar nota fiscal</Button>
                {form.reembolsoNotaFiscalNome && <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--gx2-success)' }}>✓ {form.reembolsoNotaFiscalNome}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button type="button" onClick={enviar}>Salvar</Button>
              <Button type="button" variant="cancel" onClick={() => setEditandoReembolso(false)}>Cancelar</Button>
            </div>
          </div>
        )}
        {loading && <p style={{ color: 'var(--gx2-texto-secundario)', marginBottom: 12 }}>Carregando...</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Nome</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Data</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Descrição</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Valor da nota</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Data da nota</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Valor reembolsado</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Situação</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reembolsos.map((r) => (
              <tr key={r.reembolsoId} style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                <td style={{ padding: 12 }}>{r.Usuario?.usuarioNome || '-'}</td>
                <td style={{ padding: 12 }}>{new Date(r.reembolsoData).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: 12 }}>{r.reembolsoDescricao || r.reembolsoObservacao || '-'}</td>
                <td style={{ padding: 12, textAlign: 'right' }}>R$ {Number(r.reembolsoValorNota ?? r.reembolsoValor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: 12 }}>{r.reembolsoDataNota ? new Date(r.reembolsoDataNota).toLocaleDateString('pt-BR') : '-'}</td>
                <td style={{ padding: 12, textAlign: 'right' }}>R$ {Number(r.reembolsoValorReembolsado ?? r.reembolsoValor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: 12 }}>{SITUACAO[r.reembolsoSituacao] || r.reembolsoSituacao}</td>
                <td style={acoesCellStyle}>
                  {r.reembolsoSituacao === 1 && (
                    <>
                      <Button type="button" size="sm" onClick={() => aprovar(r.reembolsoId)}>Aprovar</Button>
                      <Button type="button" variant="danger" size="sm" onClick={() => negar(r.reembolsoId)}>Negar</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reembolsos.length === 0 && !loading && <p style={{ padding: 24, textAlign: 'center', color: 'var(--gx2-texto-secundario)' }}>Nenhum reembolso encontrado</p>}
      </Card>
    </div>
  );
}
