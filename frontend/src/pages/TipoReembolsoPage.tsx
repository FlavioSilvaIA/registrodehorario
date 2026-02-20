/**
 * Tipo de Reembolso - Cadastro de tipos (descrição)
 * Página separada para CRUD de tipos de reembolso
 */
import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';

interface TipoReembolso {
  tipoReembolsoId: number;
  tipoReembolsoDescricao: string;
}

const inputStyle = { padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 'var(--radius-sm)', minWidth: 200 };
const acoesCellStyle = { display: 'flex', flexDirection: 'row' as const, gap: 8, padding: 12, alignItems: 'center', justifyContent: 'flex-end' };
const btnEditIcon = { width: 32, height: 32, borderRadius: '50%', background: 'var(--gx2-cinza-200)', color: 'var(--gx2-cinza-600)', border: 'none', cursor: 'pointer', display: 'inline-flex' as const, alignItems: 'center', justifyContent: 'center', marginRight: 4 };
const btnDeleteIcon = { width: 32, height: 32, borderRadius: '50%', background: 'transparent', color: 'var(--gx2-danger)', border: 'none', cursor: 'pointer', display: 'inline-flex' as const, alignItems: 'center', justifyContent: 'center' };

export default function TipoReembolsoPage() {
  const toast = useToast();
  const [lista, setLista] = useState<TipoReembolso[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<TipoReembolso | null>(null);
  const [descricao, setDescricao] = useState('');

  const carregar = () => {
    setLoading(true);
    api.get('/reembolsos/tipos')
      .then((r) => setLista(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setEditando({ tipoReembolsoId: 0, tipoReembolsoDescricao: '' });
    setDescricao('');
  };

  const abrirEditar = (t: TipoReembolso) => {
    setEditando(t);
    setDescricao(t.tipoReembolsoDescricao);
  };

  const salvar = async () => {
    const d = descricao.trim();
    if (!d) {
      toast.error('Informe a descrição.');
      return;
    }
    try {
      if (editando?.tipoReembolsoId) {
        await api.put(`/reembolsos/tipos/${editando.tipoReembolsoId}`, { tipoReembolsoDescricao: d });
      } else {
        await api.post('/reembolsos/tipos', { tipoReembolsoDescricao: d });
      }
      setEditando(null);
      carregar();
      toast.success('Salvo.');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const excluir = (id: number) => {
    if (!confirm('Excluir este tipo de reembolso?')) return;
    api.delete(`/reembolsos/tipos/${id}`)
      .then(() => { carregar(); toast.success('Excluído.'); })
      .catch((err) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao excluir.'));
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h3>Tipo de Reembolso</h3>
        <Button type="button" onClick={abrirNovo}>+ Tipo</Button>
      </div>

      {editando && (
        <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
          <h4 style={{ marginBottom: 12, fontSize: 14 }}>{editando.tipoReembolsoId ? 'Editar' : 'Tipo'}</h4>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Descrição</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Alimentação, Transporte..."
                style={{ ...inputStyle, width: 280 }}
              />
            </div>
            <Button type="button" onClick={salvar}>Salvar</Button>
            <Button type="button" variant="cancel" onClick={() => setEditando(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
            <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Descrição</th>
            <th style={{ padding: 12, textAlign: 'right', fontSize: 12, color: 'var(--gx2-texto-secundario)', minWidth: 120 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((t) => (
            <tr key={t.tipoReembolsoId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
              <td style={{ padding: 12 }}>{t.tipoReembolsoDescricao}</td>
              <td style={acoesCellStyle}>
                <button type="button" onClick={() => abrirEditar(t)} style={btnEditIcon} title="Editar" aria-label="Editar"><Pencil size={16} /></button>
                <button type="button" onClick={() => excluir(t.tipoReembolsoId)} style={btnDeleteIcon} title="Excluir" aria-label="Excluir"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {lista.length === 0 && !loading && (
        <EmptyState title="Nenhum tipo cadastrado" description="Clique em + Tipo para adicionar." />
      )}
    </Card>
  );
}
