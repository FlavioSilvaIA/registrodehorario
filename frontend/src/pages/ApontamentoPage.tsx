/**
 * ApontamentoPage - Equivalente a SdApontamento
 * Origem: sdapontamento.properties.json
 * Registrar entrada ou saída (automático ou manual)
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import { FormFieldLabel, FormInput, FormSelect, FormTextarea } from '../components/ui/FormField';

interface Projeto {
  projetoId: number;
  projetoDescricao: string;
}
interface Etapa {
  projetoEtapaId: number;
  projetoEtapaNome: string;
}
interface Atividade {
  projetoEtapaAtividadeId: number;
  projetoEtapaAtividadeNome: string;
}

const hojeStr = () => new Date().toISOString().split('T')[0];

export default function ApontamentoPage() {
  const navigate = useNavigate();
  const [modoManual, setModoManual] = useState(false);
  const [apontamentoAberto, setApontamentoAberto] = useState<{ apontamentoId: number } | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [projetoId, setProjetoId] = useState<number | ''>('');
  const [etapaId, setEtapaId] = useState<number | ''>('');
  const [atividadeId, setAtividadeId] = useState<number | ''>('');
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  // Campos para registro manual
  const [dataManual, setDataManual] = useState(hojeStr());
  const [inicioManual, setInicioManual] = useState('08:00');
  const [fimManual, setFimManual] = useState('17:00');

  useEffect(() => {
    api.get('/apontamentos/aberto').then((r) => setApontamentoAberto(r.data.apontamento));
    api.get('/projetos').then((r) => setProjetos(r.data));
  }, []);

  useEffect(() => {
    if (projetoId) {
      api.get(`/projetos/${projetoId}/etapas`).then((r) => {
        setEtapas(r.data);
        setEtapaId('');
        setAtividadeId('');
        setAtividades([]);
      });
    } else {
      setEtapas([]);
      setEtapaId('');
      setAtividades([]);
    }
  }, [projetoId]);

  useEffect(() => {
    if (etapaId) {
      api.get(`/projetos/etapas/${etapaId}/atividades`).then((r) => {
        setAtividades(r.data);
        setAtividadeId('');
      });
    } else {
      setAtividades([]);
      setAtividadeId('');
    }
  }, [etapaId]);

  const registrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await api.post('/apontamentos/entrada', {
        projetoId: projetoId || undefined,
        projetoEtapaAtividadeId: atividadeId || undefined,
        apontamentoComentario: comentario || undefined,
      });
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao registrar';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const registrarSaida = async () => {
    if (!apontamentoAberto) return;
    setLoading(true);
    try {
      await api.put(`/apontamentos/${apontamentoAberto.apontamentoId}/saida`);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao registrar';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const usarHorarioServidor = async (campo: 'entrada' | 'saida') => {
    try {
      const res = await api.get<{ data: string; hora: string }>('/apontamentos/servidor-agora');
      const { data: dataStr, hora } = res.data;
      if (campo === 'entrada') {
        setDataManual(dataStr);
        setInicioManual(hora);
      } else {
        setDataManual(dataStr);
        setFimManual(hora);
      }
    } catch {
      setErro('Não foi possível obter o horário do servidor');
    }
  };

  const registrarManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await api.post('/apontamentos/manual', {
        data: dataManual,
        inicio: inicioManual,
        fim: fimManual,
        projetoId: projetoId || undefined,
        projetoEtapaAtividadeId: atividadeId || undefined,
        apontamentoComentario: comentario || undefined,
      });
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao registrar';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  if (modoManual) {
    return (
      <div style={{ maxWidth: 640, margin: '40px auto', padding: 32, background: 'var(--gx2-branco)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Registro manual (entrada e saída)</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => setModoManual(false)}>
            ← Automático
          </Button>
        </div>
        <p style={{ color: 'var(--gx2-texto-secundario)', fontSize: 14, marginBottom: 20 }}>
          Informe manualmente a data e os horários de entrada e saída, sem controle automático do sistema.
        </p>
        <form onSubmit={registrarManual}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20, alignItems: 'end' }}>
            <FormInput type="date" label="Data" value={dataManual} onChange={(e) => setDataManual(e.target.value)} required />
            <FormFieldLabel label="Hora entrada">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="time"
                  value={inicioManual}
                  onChange={(e) => setInicioManual(e.target.value)}
                  required
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontFamily: 'inherit' }}
                />
                <Button type="button" variant="success" size="sm" onClick={() => usarHorarioServidor('entrada')} title="Usar horário atual do servidor">
                  <Clock size={16} style={{ marginRight: 6 }} /> Agora
                </Button>
              </div>
            </FormFieldLabel>
            <FormFieldLabel label="Hora saída">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="time"
                  value={fimManual}
                  onChange={(e) => setFimManual(e.target.value)}
                  required
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontFamily: 'inherit' }}
                />
                <Button type="button" variant="success" size="sm" onClick={() => usarHorarioServidor('saida')} title="Usar horário atual do servidor">
                  <Clock size={16} style={{ marginRight: 6 }} /> Agora
                </Button>
              </div>
            </FormFieldLabel>
          </div>
          <FormSelect label="Projeto" value={projetoId} onChange={(e) => setProjetoId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">— Selecione —</option>
              {projetos.map((p) => (
                <option key={p.projetoId} value={p.projetoId}>{p.projetoDescricao}</option>
              ))}
            </FormSelect>
          {projetoId && (
            <>
              <FormSelect label="Etapa" value={etapaId} onChange={(e) => setEtapaId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">— Selecione —</option>
                  {etapas.map((e) => (
                    <option key={e.projetoEtapaId} value={e.projetoEtapaId}>{e.projetoEtapaNome}</option>
                  ))}
                </FormSelect>
              {etapaId && (
                <FormSelect label="Atividade" value={atividadeId} onChange={(e) => setAtividadeId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">— Selecione —</option>
                    {atividades.map((a) => (
                      <option key={a.projetoEtapaAtividadeId} value={a.projetoEtapaAtividadeId}>{a.projetoEtapaAtividadeNome}</option>
                    ))}
                  </FormSelect>
              )}
            </>
          )}
          <FormTextarea label="Comentário" value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} />
          {erro && <p style={{ color: 'var(--gx2-danger)', marginBottom: 16 }}>{erro}</p>}
          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Salvando...' : 'Salvar registro manual'}
          </Button>
        </form>
        <Link to="/" style={{ display: 'block', marginTop: 16, color: 'var(--gx2-turquesa)' }}>← Voltar</Link>
      </div>
    );
  }

  if (apontamentoAberto) {
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: 'var(--gx2-branco)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Registrar saída</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => setModoManual(true)}>
            Registro manual →
          </Button>
        </div>
        <p style={{ margin: '16px 0' }}>Você tem um apontamento em aberto.</p>
        {erro && <p style={{ color: 'var(--gx2-danger)', marginBottom: 16 }}>{erro}</p>}
        <Button onClick={registrarSaida} disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar saída'}
        </Button>
        <Link to="/" style={{ display: 'block', marginTop: 16, color: 'var(--gx2-turquesa)' }}>← Voltar</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: 'var(--gx2-branco)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Registrar entrada</h2>
        <Button type="button" variant="secondary" size="sm" onClick={() => setModoManual(true)}>
          Registro manual →
        </Button>
      </div>
      <form onSubmit={registrarEntrada}>
        <FormSelect label="Projeto" value={projetoId} onChange={(e) => setProjetoId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">— Selecione —</option>
            {projetos.map((p) => (
              <option key={p.projetoId} value={p.projetoId}>{p.projetoDescricao}</option>
            ))}
          </FormSelect>
        {projetoId && (
          <>
<FormSelect label="Etapa" value={etapaId} onChange={(e) => setEtapaId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">— Selecione —</option>
                {etapas.map((e) => (
                  <option key={e.projetoEtapaId} value={e.projetoEtapaId}>{e.projetoEtapaNome}</option>
                ))}
              </FormSelect>
            {etapaId && (
<FormSelect label="Atividade" value={atividadeId} onChange={(e) => setAtividadeId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">— Selecione —</option>
                {atividades.map((a) => (
                  <option key={a.projetoEtapaAtividadeId} value={a.projetoEtapaAtividadeId}>{a.projetoEtapaAtividadeNome}</option>
                ))}
              </FormSelect>
            )}
          </>
        )}
        <FormTextarea label="Comentário" value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} />
        {erro && <p style={{ color: 'var(--gx2-danger)', marginBottom: 16 }}>{erro}</p>}
        <Button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Registrando...' : 'Registrar entrada'}
        </Button>
      </form>
      <Link to="/" style={{ display: 'block', marginTop: 16, color: 'var(--gx2-turquesa)' }}>← Voltar</Link>
    </div>
  );
}
