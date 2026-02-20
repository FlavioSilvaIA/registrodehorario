/**
 * Parâmetros - Configurações do sistema
 * Equivalente a tela de parâmetros do sistema original GeneXus
 */
import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';

export default function ParametrosPage() {
  const toast = useToast();
  const [parametros, setParametros] = useState<{ parametroId: number; parametroChave: string; parametroValor: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<Record<string, string>>({});
  const [novoParametro, setNovoParametro] = useState('');
  const [novoValor, setNovoValor] = useState('');

  const carregar = () => {
    setLoading(true);
    api.get('/parametros').then((r) => {
      setParametros(r.data);
      const map: Record<string, string> = {};
      r.data.forEach((p: { parametroChave: string; parametroValor: string }) => { map[p.parametroChave] = p.parametroValor ?? ''; });
      setEditando(map);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const salvar = (chave: string) => {
    const valor = editando[chave];
    if (valor === undefined) return;
    api.post('/parametros', { parametroChave: chave, parametroValor: valor }).then(() => { carregar(); toast.success('Salvo.'); }).catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const adicionar = () => {
    if (!novoParametro.trim()) {
      toast.error('Informe o parâmetro.');
      return;
    }
    api.post('/parametros', { parametroChave: novoParametro.trim(), parametroValor: novoValor }).then(() => {
      setNovoParametro('');
      setNovoValor('');
      carregar();
      toast.success('Adicionado.');
    }).catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const excluir = (id: number) => {
    if (!confirm('Excluir este parâmetro?')) return;
    api.delete(`/parametros/${id}`).then(() => { carregar(); toast.success('Excluído.'); }).catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20 }}>Parâmetros</h2>

      <Card>
        {/* Seção de adicionar - como no original GeneXus */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Parâmetro</label>
            <input
              type="text"
              value={novoParametro}
              onChange={(e) => setNovoParametro(e.target.value)}
              placeholder="Ex: HORAS_TOLERANCIA"
              style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4, minWidth: 280 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Valor</label>
            <input
              type="text"
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
              placeholder="Ex: 0.50"
              style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4, minWidth: 200 }}
            />
          </div>
          <Button
            onClick={adicionar}
            title="Adicionar parâmetro"
            style={{ width: 44, height: 44, borderRadius: '50%', fontSize: 24, lineHeight: 1, padding: 0 }}
          >
            +
          </Button>
        </div>

        {/* Tabela de parâmetros */}
        {loading && <p style={{ color: 'var(--gx2-texto-secundario)', marginBottom: 16 }}>Carregando...</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Parâmetro</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Valor</th>
              <th style={{ padding: 12, width: 80, textAlign: 'right', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}></th>
            </tr>
          </thead>
          <tbody>
            {parametros.map((p) => (
              <tr key={p.parametroId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                <td style={{ padding: 12 }}>{p.parametroChave}</td>
                <td style={{ padding: 12 }}>
                  <input
                    type="text"
                    value={editando[p.parametroChave] ?? p.parametroValor ?? ''}
                    onChange={(e) => setEditando({ ...editando, [p.parametroChave]: e.target.value })}
                    style={{ width: '100%', maxWidth: 400, padding: '6px 10px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4 }}
                  />
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <button onClick={() => salvar(p.parametroChave)} title="Salvar alteração" aria-label="Salvar" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gx2-cinza-200)', color: 'var(--gx2-texto-secundario)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => excluir(p.parametroId)} title="Excluir" aria-label="Excluir" style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', color: 'var(--gx2-danger)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {parametros.length === 0 && !loading && <EmptyState title="Nenhum parâmetro cadastrado" description="Adicione um parâmetro usando o formulário acima." />}
      </Card>
    </div>
  );
}
