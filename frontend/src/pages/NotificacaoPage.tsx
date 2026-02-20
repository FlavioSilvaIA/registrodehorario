/**
 * Notificação - Cadastro, Alertas, Vincular usuário, Administradores, Consulta envios
 */
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';

type SubmenuId = 'cadastro' | 'alertas' | 'vincular-usuario' | 'administradores' | 'consulta-envios';

const SUBMENU: { id: SubmenuId; label: string }[] = [
  { id: 'cadastro', label: 'Cadastro' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'vincular-usuario', label: 'Vincular usuário' },
  { id: 'administradores', label: 'Administradores' },
  { id: 'consulta-envios', label: 'Consulta envios' },
];

const inputStyle = { padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 'var(--radius-sm)', minWidth: 200 };
const btnEditIcon = { width: 32, height: 32, borderRadius: '50%', background: 'var(--gx2-cinza-200)', color: 'var(--gx2-cinza-600)', border: 'none', cursor: 'pointer', display: 'inline-flex' as const, alignItems: 'center', justifyContent: 'center', marginRight: 4 };
const btnDeleteIcon = { width: 32, height: 32, borderRadius: '50%', background: 'transparent', color: 'var(--gx2-danger)', border: 'none', cursor: 'pointer', display: 'inline-flex' as const, alignItems: 'center', justifyContent: 'center' };

export default function NotificacaoPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get('tab') || 'cadastro') as SubmenuId;
  const validTab = SUBMENU.some((s) => s.id === tabFromUrl) ? tabFromUrl : 'cadastro';
  const [submenu, setSubmenu] = useState<SubmenuId>(validTab);

  // Cadastro (notificações)
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [filtroCadastroEmpresa, setFiltroCadastroEmpresa] = useState('');
  const [filtroCadastroNotificacao, setFiltroCadastroNotificacao] = useState('');
  const [filtroCadastroEmail, setFiltroCadastroEmail] = useState('');
  const [filtroCadastroSite, setFiltroCadastroSite] = useState('');
  const [filtroCadastroCelular, setFiltroCadastroCelular] = useState('');
  const [editandoNotificacao, setEditandoNotificacao] = useState<any>(null);
  const [formNotificacao, setFormNotificacao] = useState({ empresaId: '', notificacaoTexto: '', enviaEmail: false, enviaSite: false, enviaCelular: false });

  // Alertas
  const [tiposAlerta, setTiposAlerta] = useState<any[]>([]);
  const [notificacoesParaAlerta, setNotificacoesParaAlerta] = useState<any[]>([]);
  const [editandoAlerta, setEditandoAlerta] = useState<any>(null);
  const [formAlerta, setFormAlerta] = useState({
    empresaId: '',
    notificacaoId: '',
    descricao: '',
    tempoDe: '',
    tempoAte: '',
    notificarAdministradores: false,
    imagemBase64: '',
    imagemNome: '',
    imagemExtensao: '',
  });
  const fileAlertaRef = useRef<HTMLInputElement>(null);

  // Vincular usuário (Notificação/TipoAlerta + Colaborador)
  const [vinculos, setVinculos] = useState<any[]>([]);
  const [tiposAlertaVinculo, setTiposAlertaVinculo] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [vinculoTipoAlertaId, setVinculoTipoAlertaId] = useState('');
  const [vinculoUsuarioId, setVinculoUsuarioId] = useState('');
  const [editandoVinculo, setEditandoVinculo] = useState<any>(null);
  const [formVinculo, setFormVinculo] = useState({ tipoAlertaId: '', usuarioId: '' });

  // Administradores (Administradores de notificação: TipoAlerta ↔ Usuario)
  const [adminVinculos, setAdminVinculos] = useState<any[]>([]);
  const [adminTiposAlerta, setAdminTiposAlerta] = useState<any[]>([]);
  const [adminUsuarios, setAdminUsuarios] = useState<any[]>([]);
  const [adminTipoAlertaId, setAdminTipoAlertaId] = useState('');
  const [adminUsuarioId, setAdminUsuarioId] = useState('');
  const [editandoAdminVinculo, setEditandoAdminVinculo] = useState<any>(null);
  const [formAdminVinculo, setFormAdminVinculo] = useState({ tipoAlertaId: '', usuarioId: '' });

  // Consulta envios (Notificação, Colaborador, Data do registro)
  const [envios, setEnvios] = useState<any[]>([]);
  const [consultaEnviosUsuarios, setConsultaEnviosUsuarios] = useState<any[]>([]);
  const [filtroEnviosNotificacao, setFiltroEnviosNotificacao] = useState('');
  const [filtroEnviosColaborador, setFiltroEnviosColaborador] = useState('');
  const [filtroEnviosDataRegistro, setFiltroEnviosDataRegistro] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => { setSubmenu(validTab); }, [validTab]);

  const carregar = () => {
    setLoading(true);
    if (submenu === 'cadastro') {
      Promise.all([
        api.get('/notificacao/cadastro', {
          params: {
            empresa: filtroCadastroEmpresa || undefined,
            notificacao: filtroCadastroNotificacao || undefined,
            email: filtroCadastroEmail || undefined,
            site: filtroCadastroSite || undefined,
            celular: filtroCadastroCelular || undefined,
          },
        }).then((r) => setNotificacoes(r.data)),
        api.get('/empresas').then((r) => setEmpresas(r.data)),
      ]).finally(() => setLoading(false));
    } else if (submenu === 'alertas') {
      Promise.all([
        api.get('/notificacao/alertas').then((r) => setTiposAlerta(r.data)),
        api.get('/empresas').then((r) => setEmpresas(r.data)),
        api.get('/notificacao/cadastro').then((r) => setNotificacoesParaAlerta(r.data)),
      ]).finally(() => setLoading(false));
    } else if (submenu === 'vincular-usuario') {
      Promise.all([
        api.get('/notificacao/vinculos-usuario').then((r) => setVinculos(r.data)),
        api.get('/notificacao/alertas').then((r) => setTiposAlertaVinculo(r.data)),
        api.get('/usuarios?todos=1').then((r) => setUsuarios(r.data)),
      ]).finally(() => setLoading(false));
    } else if (submenu === 'administradores') {
      Promise.all([
        api.get('/notificacao/vinculos-usuario').then((r) => setAdminVinculos(r.data)),
        api.get('/notificacao/alertas').then((r) => setAdminTiposAlerta(r.data)),
        api.get('/usuarios?todos=1').then((r) => setAdminUsuarios(r.data)),
      ]).finally(() => setLoading(false));
    } else if (submenu === 'consulta-envios') {
      Promise.all([
        api.get('/logs', { params: { descricao: filtroEnviosNotificacao || undefined, colaborador: filtroEnviosColaborador || undefined, data: filtroEnviosDataRegistro || undefined } }).then((r) => setEnvios(r.data)),
        api.get('/usuarios?todos=1').then((r) => setConsultaEnviosUsuarios(r.data)),
      ]).finally(() => setLoading(false));
    }
  };

  useEffect(() => { carregar(); }, [submenu]);

  const salvarNotificacao = () => {
    if (!formNotificacao.empresaId) { toast.error('Selecione a empresa.'); return; }
    const payload = {
      empresaId: Number(formNotificacao.empresaId),
      notificacaoTexto: formNotificacao.notificacaoTexto,
      notificacaoEnviaEmail: formNotificacao.enviaEmail,
      notificacaoEnviaSite: formNotificacao.enviaSite,
      notificacaoEnviaCelular: formNotificacao.enviaCelular,
    };
    (editandoNotificacao?.notificacaoId
      ? api.put(`/notificacao/cadastro/${editandoNotificacao.notificacaoId}`, payload)
      : api.post('/notificacao/cadastro', payload))
      .then(() => { setEditandoNotificacao(null); setFormNotificacao({ empresaId: '', notificacaoTexto: '', enviaEmail: false, enviaSite: false, enviaCelular: false }); carregar(); toast.success('Notificação salva.'); })
      .catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const salvarAlerta = () => {
    if (!formAlerta.descricao.trim()) { toast.error('Informe a descrição.'); return; }
    const payload = {
      empresaId: formAlerta.empresaId || null,
      notificacaoId: formAlerta.notificacaoId || null,
      tipoAlertaDescricao: formAlerta.descricao,
      tipoAlertaTempoDe: formAlerta.tempoDe ? Number(String(formAlerta.tempoDe).replace(',', '.')) : null,
      tipoAlertaTempoAte: formAlerta.tempoAte ? Number(String(formAlerta.tempoAte).replace(',', '.')) : null,
      tipoAlertaNotificarAdministradores: formAlerta.notificarAdministradores,
      tipoAlertaImagemBase64: formAlerta.imagemBase64 || null,
      tipoAlertaImagemNome: formAlerta.imagemNome || null,
      tipoAlertaImagemExtensao: formAlerta.imagemExtensao || null,
    };
    (editandoAlerta?.tipoAlertaId
      ? api.put(`/notificacao/alertas/${editandoAlerta.tipoAlertaId}`, payload)
      : api.post('/notificacao/alertas', payload))
      .then(() => {
        setEditandoAlerta(null);
        setFormAlerta({ empresaId: '', notificacaoId: '', descricao: '', tempoDe: '', tempoAte: '', notificarAdministradores: false, imagemBase64: '', imagemNome: '', imagemExtensao: '' });
        carregar();
        toast.success('Alerta salvo.');
      })
      .catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const vincular = () => {
    if (!vinculoTipoAlertaId || !vinculoUsuarioId) { toast.error('Selecione Notificação e Colaborador.'); return; }
    api.post('/notificacao/vinculos-usuario', { tipoAlertaId: Number(vinculoTipoAlertaId), usuarioId: Number(vinculoUsuarioId) })
      .then(() => { setVinculoTipoAlertaId(''); setVinculoUsuarioId(''); carregar(); toast.success('Vínculo adicionado.'); })
      .catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const salvarVinculo = () => {
    if (!formVinculo.tipoAlertaId || !formVinculo.usuarioId) { toast.error('Selecione Notificação e Colaborador.'); return; }
    const payload = { tipoAlertaId: Number(formVinculo.tipoAlertaId), usuarioId: Number(formVinculo.usuarioId) };
    const isEdit = editandoVinculo?.notificacaoUsuarioId;
    (isEdit
      ? api.delete(`/notificacao/vinculos-usuario/${editandoVinculo.notificacaoUsuarioId}`).then(() => api.post('/notificacao/vinculos-usuario', payload))
      : api.post('/notificacao/vinculos-usuario', payload)
    )
      .then(() => { setEditandoVinculo(null); setFormVinculo({ tipoAlertaId: '', usuarioId: '' }); carregar(); toast.success('Vínculo salvo.'); })
      .catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const vincularAdmin = () => {
    if (!adminTipoAlertaId || !adminUsuarioId) { toast.error('Selecione Notificação e Colaborador.'); return; }
    api.post('/notificacao/vinculos-usuario', { tipoAlertaId: Number(adminTipoAlertaId), usuarioId: Number(adminUsuarioId) })
      .then(() => { setAdminTipoAlertaId(''); setAdminUsuarioId(''); carregar(); toast.success('Vínculo adicionado.'); })
      .catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  const salvarAdminVinculo = () => {
    if (!formAdminVinculo.tipoAlertaId || !formAdminVinculo.usuarioId) { toast.error('Selecione Notificação e Colaborador.'); return; }
    const payload = { tipoAlertaId: Number(formAdminVinculo.tipoAlertaId), usuarioId: Number(formAdminVinculo.usuarioId) };
    const isEdit = editandoAdminVinculo?.notificacaoUsuarioId;
    (isEdit
      ? api.delete(`/notificacao/vinculos-usuario/${editandoAdminVinculo.notificacaoUsuarioId}`).then(() => api.post('/notificacao/vinculos-usuario', payload))
      : api.post('/notificacao/vinculos-usuario', payload)
    )
      .then(() => { setEditandoAdminVinculo(null); setFormAdminVinculo({ tipoAlertaId: '', usuarioId: '' }); carregar(); toast.success('Vínculo salvo.'); })
      .catch((e) => toast.error(e?.response?.data?.error || 'Erro'));
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20 }}>Notificação</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {SUBMENU.map((s) => (
          <Button
            key={s.id}
            variant={submenu === s.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSearchParams({ tab: s.id })}
            style={submenu === s.id ? { background: 'var(--gx2-azul-marinho)' } : undefined}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Cadastro */}
      {submenu === 'cadastro' && (
        <Card>
          <h3 style={{ marginBottom: 16 }}>Notificação</h3>
          {/* Pesquisa */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Empresa</label>
              <select value={filtroCadastroEmpresa} onChange={(e) => setFiltroCadastroEmpresa(e.target.value)} style={{ ...inputStyle, minWidth: 180 }}>
                <option value="">Todas</option>
                {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificação</label>
              <input type="text" value={filtroCadastroNotificacao} onChange={(e) => setFiltroCadastroNotificacao(e.target.value)} placeholder="Texto" style={{ ...inputStyle, minWidth: 180 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Email</label>
              <select value={filtroCadastroEmail} onChange={(e) => setFiltroCadastroEmail(e.target.value)} style={{ ...inputStyle, minWidth: 100 }}>
                <option value="">Todos</option>
                <option value="1">Sim</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Site</label>
              <select value={filtroCadastroSite} onChange={(e) => setFiltroCadastroSite(e.target.value)} style={{ ...inputStyle, minWidth: 100 }}>
                <option value="">Todos</option>
                <option value="1">Sim</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Celular</label>
              <select value={filtroCadastroCelular} onChange={(e) => setFiltroCadastroCelular(e.target.value)} style={{ ...inputStyle, minWidth: 100 }}>
                <option value="">Todos</option>
                <option value="1">Sim</option>
              </select>
            </div>
            <Button onClick={carregar}>Pesquisar</Button>
          </div>
          {/* Formulário Nova Notificação */}
          {editandoNotificacao && (
            <div style={{ marginBottom: 20, padding: 20, background: 'var(--gx2-cinza-100)', borderRadius: 8, border: '1px solid var(--gx2-cinza-200)' }}>
              <h4 style={{ marginBottom: 16, fontSize: 16 }}>Notificação</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Empresa</label>
                  <select value={formNotificacao.empresaId} onChange={(e) => setFormNotificacao({ ...formNotificacao, empresaId: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    <option value="">Selecione</option>
                    {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificação</label>
                  <input type="text" value={formNotificacao.notificacaoTexto} onChange={(e) => setFormNotificacao({ ...formNotificacao, notificacaoTexto: e.target.value })} placeholder="Texto da notificação" style={{ ...inputStyle, width: '100%' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={formNotificacao.enviaEmail} onChange={(e) => setFormNotificacao({ ...formNotificacao, enviaEmail: e.target.checked })} />Enviar notificação por email</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={formNotificacao.enviaSite} onChange={(e) => setFormNotificacao({ ...formNotificacao, enviaSite: e.target.checked })} />Enviar notificação no site</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={formNotificacao.enviaCelular} onChange={(e) => setFormNotificacao({ ...formNotificacao, enviaCelular: e.target.checked })} />Enviar notificação no celular</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={salvarNotificacao}>Confirmar</Button>
                  <Button variant="ghost" onClick={() => { setEditandoNotificacao(null); setFormNotificacao({ empresaId: '', notificacaoTexto: '', enviaEmail: false, enviaSite: false, enviaCelular: false }); }} style={{ background: 'var(--gx2-branco)', color: 'var(--gx2-texto)' }}>Fechar</Button>
                </div>
              </div>
            </div>
          )}
          {!editandoNotificacao && (
            <Button onClick={() => { setEditandoNotificacao({}); setFormNotificacao({ empresaId: '', notificacaoTexto: '', enviaEmail: false, enviaSite: false, enviaCelular: false }); }} style={{ marginBottom: 16 }}>Nova notificação</Button>
          )}
          {/* Grid */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}><th style={{ padding: 12, textAlign: 'left' }}>Empresa</th><th style={{ padding: 12, textAlign: 'left' }}>Notificação</th><th style={{ padding: 12, textAlign: 'center' }}>Email</th><th style={{ padding: 12, textAlign: 'center' }}>Site</th><th style={{ padding: 12, textAlign: 'center' }}>Celular</th><th style={{ padding: 12, textAlign: 'right' }}>Ações</th></tr></thead>
            <tbody>
              {notificacoes.map((n) => (
                <tr key={n.notificacaoId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                  <td style={{ padding: 12 }}>{n.Empresa?.empresaDescricao || '-'}</td>
                  <td style={{ padding: 12 }}>{n.notificacaoTexto || '-'}</td>
                  <td style={{ padding: 12, textAlign: 'center' }}><input type="checkbox" checked={!!n.notificacaoEnviaEmail} readOnly /></td>
                  <td style={{ padding: 12, textAlign: 'center' }}><input type="checkbox" checked={!!n.notificacaoEnviaSite} readOnly /></td>
                  <td style={{ padding: 12, textAlign: 'center' }}><input type="checkbox" checked={!!n.notificacaoEnviaCelular} readOnly /></td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <button onClick={() => { setEditandoNotificacao(n); setFormNotificacao({ empresaId: String(n.empresaId), notificacaoTexto: n.notificacaoTexto || '', enviaEmail: !!n.notificacaoEnviaEmail, enviaSite: !!n.notificacaoEnviaSite, enviaCelular: !!n.notificacaoEnviaCelular }); }} style={btnEditIcon} title="Editar" aria-label="Editar"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm('Excluir?')) api.delete(`/notificacao/cadastro/${n.notificacaoId}`).then(() => { carregar(); toast.success('Excluído.'); }); }} style={btnDeleteIcon} title="Excluir" aria-label="Excluir"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {notificacoes.length === 0 && !loading && <EmptyState title="Nenhuma notificação" description="Clique em Nova notificação para adicionar." />}
        </Card>
      )}

      {/* Alertas */}
      {submenu === 'alertas' && (
        <Card>
          <h3 style={{ marginBottom: 16 }}>Tipo de alertas</h3>
          {/* Formulário - tela inicial com campos em linha + botão + */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Empresa</label>
              <select value={formAlerta.empresaId} onChange={(e) => setFormAlerta({ ...formAlerta, empresaId: e.target.value })} style={{ ...inputStyle, minWidth: 200 }}>
                <option value="">Selecione</option>
                {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Descrição</label>
              <input type="text" value={formAlerta.descricao} onChange={(e) => setFormAlerta({ ...formAlerta, descricao: e.target.value })} placeholder="Descrição do alerta de notificação" style={{ ...inputStyle, minWidth: 280 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Tempo para enviar o alerta de</label>
              <input type="number" step="0.01" value={formAlerta.tempoDe} onChange={(e) => setFormAlerta({ ...formAlerta, tempoDe: e.target.value })} placeholder="0,00" style={{ ...inputStyle, width: 90 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Até</label>
              <input type="number" step="0.01" value={formAlerta.tempoAte} onChange={(e) => setFormAlerta({ ...formAlerta, tempoAte: e.target.value })} placeholder="0,00" style={{ ...inputStyle, width: 90 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificar administradores</label>
              <select value={formAlerta.notificarAdministradores ? '1' : '0'} onChange={(e) => setFormAlerta({ ...formAlerta, notificarAdministradores: e.target.value === '1' })} style={{ ...inputStyle, minWidth: 140 }}>
                <option value="">Selecione</option>
                <option value="1">Sim</option>
                <option value="0">Não</option>
              </select>
            </div>
            <Button onClick={() => setEditandoAlerta({})} style={{ width: 44, height: 44, borderRadius: '50%', fontSize: 24, lineHeight: 1, padding: 0 }} title="Novo alerta">+</Button>
          </div>
          {/* Formulário expandido - Tipo de alerta (quando novo/editar) */}
          {editandoAlerta && (
            <div style={{ marginBottom: 24, padding: 24, background: 'var(--gx2-cinza-100)', borderRadius: 8, border: '1px solid var(--gx2-cinza-200)' }}>
              <h4 style={{ marginBottom: 16, fontSize: 16, color: 'var(--gx2-texto-secundario)' }}>Tipo de alerta</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificação</label>
                  <select value={formAlerta.notificacaoId} onChange={(e) => setFormAlerta({ ...formAlerta, notificacaoId: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    <option value="">Selecione</option>
                    {notificacoesParaAlerta.map((n) => <option key={n.notificacaoId} value={n.notificacaoId}>{n.notificacaoTexto?.slice(0, 50) || n.Empresa?.empresaDescricao || '-'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Descrição do alerta de notificação</label>
                  <textarea value={formAlerta.descricao} onChange={(e) => setFormAlerta({ ...formAlerta, descricao: e.target.value })} placeholder="Descrição do alerta de notificação" rows={8} style={{ ...inputStyle, width: '100%', minHeight: 160, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Tempo para enviar o alerta</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input type="number" step="0.01" value={formAlerta.tempoDe} onChange={(e) => setFormAlerta({ ...formAlerta, tempoDe: e.target.value })} placeholder="0,00" style={{ ...inputStyle, width: 100 }} />
                    <span>até</span>
                    <input type="number" step="0.01" value={formAlerta.tempoAte} onChange={(e) => setFormAlerta({ ...formAlerta, tempoAte: e.target.value })} placeholder="0,00" style={{ ...inputStyle, width: 100 }} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={formAlerta.notificarAdministradores} onChange={(e) => setFormAlerta({ ...formAlerta, notificarAdministradores: e.target.checked })} />Notificar administradores</label>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Imagem (enviar junto com o texto)</label>
                  <input ref={fileAlertaRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = () => setFormAlerta({ ...formAlerta, imagemBase64: (r.result as string)?.split(',')[1], imagemNome: f.name, imagemExtensao: f.name.split('.').pop() || '' });
                      r.readAsDataURL(f);
                    }
                    e.target.value = '';
                  }} />
                  <Button type="button" variant="secondary" size="sm" onClick={() => fileAlertaRef.current?.click()}>Carregar imagem</Button>
                  {formAlerta.imagemNome && <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--gx2-success)' }}>✓ {formAlerta.imagemNome}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={salvarAlerta}>Confirmar</Button>
                  <Button variant="ghost" onClick={() => { setEditandoAlerta(null); setFormAlerta({ empresaId: '', notificacaoId: '', descricao: '', tempoDe: '', tempoAte: '', notificarAdministradores: false, imagemBase64: '', imagemNome: '', imagemExtensao: '' }); }} style={{ background: 'var(--gx2-branco)', color: 'var(--gx2-texto)' }}>Fechar</Button>
                </div>
              </div>
            </div>
          )}
          {/* Grid */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}><th style={{ padding: 12, textAlign: 'left' }}>Empresa</th><th style={{ padding: 12, textAlign: 'left' }}>Descrição</th><th style={{ padding: 12, textAlign: 'left' }}>Tempo para enviar o alerta</th><th style={{ padding: 12, textAlign: 'center' }}>Notificar administradores</th><th style={{ padding: 12, textAlign: 'right' }}>Ações</th></tr></thead>
            <tbody>
              {tiposAlerta.map((t) => (
                <tr key={t.tipoAlertaId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                  <td style={{ padding: 12 }}>{t.Empresa?.empresaDescricao || '-'}</td>
                  <td style={{ padding: 12 }}>{t.tipoAlertaDescricao || '-'}</td>
                  <td style={{ padding: 12 }}>{t.tipoAlertaTempoDe != null && t.tipoAlertaTempoAte != null ? `${t.tipoAlertaTempoDe} - ${t.tipoAlertaTempoAte}` : t.tipoAlertaTempoDe ?? t.tipoAlertaTempoAte ?? '-'}</td>
                  <td style={{ padding: 12, textAlign: 'center' }}><input type="checkbox" checked={!!t.tipoAlertaNotificarAdministradores} readOnly /></td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <button onClick={() => { setEditandoAlerta(t); setFormAlerta({ empresaId: String(t.empresaId || ''), notificacaoId: String(t.notificacaoId || ''), descricao: t.tipoAlertaDescricao || '', tempoDe: t.tipoAlertaTempoDe != null ? String(t.tipoAlertaTempoDe) : '', tempoAte: t.tipoAlertaTempoAte != null ? String(t.tipoAlertaTempoAte) : '', notificarAdministradores: !!t.tipoAlertaNotificarAdministradores, imagemBase64: t.tipoAlertaImagemBase64 || '', imagemNome: t.tipoAlertaImagemNome || '', imagemExtensao: t.tipoAlertaImagemExtensao || '' }); }} style={btnEditIcon} title="Editar" aria-label="Editar"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm('Excluir?')) api.delete(`/notificacao/alertas/${t.tipoAlertaId}`).then(() => { carregar(); toast.success('Excluído.'); }); }} style={btnDeleteIcon} title="Excluir" aria-label="Excluir"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tiposAlerta.length === 0 && !loading && <EmptyState title="Nenhum tipo de alerta" description="Preencha os campos acima e clique em + para adicionar." />}
        </Card>
      )}

      {/* Vincular usuário */}
      {submenu === 'vincular-usuario' && (
        <Card>
          <h3 style={{ marginBottom: 16 }}>Vincular usuário</h3>
          {/* Tela inicial: Notificação + Colaborador + botão + */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificação</label>
              <select value={vinculoTipoAlertaId} onChange={(e) => setVinculoTipoAlertaId(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
                <option value="">Selecione</option>
                {tiposAlertaVinculo.map((t) => <option key={t.tipoAlertaId} value={t.tipoAlertaId}>{t.tipoAlertaDescricao || '-'}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Colaborador</label>
              <select value={vinculoUsuarioId} onChange={(e) => setVinculoUsuarioId(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
                <option value="">Selecione</option>
                {usuarios.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
              </select>
            </div>
            <Button
              onClick={() => {
                if (vinculoTipoAlertaId && vinculoUsuarioId) vincular();
                else { setEditandoVinculo({}); setFormVinculo({ tipoAlertaId: vinculoTipoAlertaId || '', usuarioId: vinculoUsuarioId || '' }); }
              }}
              style={{ width: 44, height: 44, borderRadius: '50%', fontSize: 24, lineHeight: 1, padding: 0 }}
              title="Adicionar"
            >+</Button>
          </div>
          {/* Formulário Notificação de usuário (novo/editar) */}
          {editandoVinculo != null && (
            <div style={{ marginBottom: 24, padding: 24, background: 'var(--gx2-cinza-100)', borderRadius: 8, border: '1px solid var(--gx2-cinza-200)' }}>
              <h4 style={{ marginBottom: 16, fontSize: 16, color: '#475569' }}>Notificação de usuário</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificação</label>
                  <select value={formVinculo.tipoAlertaId} onChange={(e) => setFormVinculo({ ...formVinculo, tipoAlertaId: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    <option value="">Selecione</option>
                    {tiposAlertaVinculo.map((t) => <option key={t.tipoAlertaId} value={t.tipoAlertaId}>{t.tipoAlertaDescricao || '-'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Colaborador</label>
                  <select value={formVinculo.usuarioId} onChange={(e) => setFormVinculo({ ...formVinculo, usuarioId: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    <option value="">Selecione</option>
                    {usuarios.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={salvarVinculo}>Confirmar</Button>
                  <Button variant="ghost" onClick={() => { setEditandoVinculo(null); setFormVinculo({ tipoAlertaId: '', usuarioId: '' }); }} style={{ background: 'var(--gx2-branco)', color: 'var(--gx2-texto)' }}>Fechar</Button>
                </div>
              </div>
            </div>
          )}
          {/* Grid */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}><th style={{ padding: 12, textAlign: 'left' }}>Notificação</th><th style={{ padding: 12, textAlign: 'left' }}>Colaborador</th><th style={{ padding: 12, textAlign: 'right' }}>Ações</th></tr></thead>
            <tbody>
              {vinculos.map((v) => (
                <tr key={v.notificacaoUsuarioId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                  <td style={{ padding: 12 }}>{v.TipoAlerta?.tipoAlertaDescricao || '-'}</td>
                  <td style={{ padding: 12 }}>{v.Usuario?.usuarioNome || '-'}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <button onClick={() => { setEditandoVinculo(v); setFormVinculo({ tipoAlertaId: String(v.tipoAlertaId), usuarioId: String(v.usuarioId) }); }} style={btnEditIcon} title="Editar" aria-label="Editar"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm('Excluir?')) api.delete(`/notificacao/vinculos-usuario/${v.notificacaoUsuarioId}`).then(() => { carregar(); toast.success('Excluído.'); }); }} style={btnDeleteIcon} title="Excluir" aria-label="Excluir"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vinculos.length === 0 && !loading && <EmptyState title="Nenhum vínculo" description="Selecione Notificação e Colaborador e clique em + para adicionar." />}
        </Card>
      )}

      {/* Administradores de notificação */}
      {submenu === 'administradores' && (
        <Card>
          <h3 style={{ marginBottom: 16, color: 'var(--gx2-texto-secundario)' }}>Administradores de notificação</h3>
          {/* Tela inicial: Notificação + Colaborador + botão + */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificação</label>
              <select value={adminTipoAlertaId} onChange={(e) => setAdminTipoAlertaId(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
                <option value="">Selecione</option>
                {adminTiposAlerta.map((t) => <option key={t.tipoAlertaId} value={t.tipoAlertaId}>{t.tipoAlertaDescricao || '-'}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Colaborador</label>
              <select value={adminUsuarioId} onChange={(e) => setAdminUsuarioId(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
                <option value="">Selecione</option>
                {adminUsuarios.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
              </select>
            </div>
            <Button
              onClick={() => {
                if (adminTipoAlertaId && adminUsuarioId) vincularAdmin();
                else { setEditandoAdminVinculo({}); setFormAdminVinculo({ tipoAlertaId: adminTipoAlertaId || '', usuarioId: adminUsuarioId || '' }); }
              }}
              style={{ width: 44, height: 44, borderRadius: '50%', fontSize: 24, lineHeight: 1, padding: 0 }}
              title="Adicionar"
            >+</Button>
          </div>
          {/* Formulário Administração de notificação (novo/editar) */}
          {editandoAdminVinculo != null && (
            <div style={{ marginBottom: 24, padding: 24, background: 'var(--gx2-cinza-100)', borderRadius: 8, border: '1px solid var(--gx2-cinza-200)' }}>
              <h4 style={{ marginBottom: 16, fontSize: 16, color: 'var(--gx2-texto-secundario)' }}>Administração de notificação</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificação</label>
                  <select value={formAdminVinculo.tipoAlertaId} onChange={(e) => setFormAdminVinculo({ ...formAdminVinculo, tipoAlertaId: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    <option value="">Selecione</option>
                    {adminTiposAlerta.map((t) => <option key={t.tipoAlertaId} value={t.tipoAlertaId}>{t.tipoAlertaDescricao || '-'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Colaborador</label>
                  <select value={formAdminVinculo.usuarioId} onChange={(e) => setFormAdminVinculo({ ...formAdminVinculo, usuarioId: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    <option value="">Selecione</option>
                    {adminUsuarios.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={salvarAdminVinculo}>Confirmar</Button>
                  <Button variant="ghost" onClick={() => { setEditandoAdminVinculo(null); setFormAdminVinculo({ tipoAlertaId: '', usuarioId: '' }); }} style={{ background: 'var(--gx2-branco)', color: 'var(--gx2-texto)' }}>Fechar</Button>
                </div>
              </div>
            </div>
          )}
          {/* Grid */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}><th style={{ padding: 12, textAlign: 'left' }}>Notificação</th><th style={{ padding: 12, textAlign: 'left' }}>Colaborador</th><th style={{ padding: 12, textAlign: 'right' }}>Ações</th></tr></thead>
            <tbody>
              {adminVinculos.map((v) => (
                <tr key={v.notificacaoUsuarioId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                  <td style={{ padding: 12 }}>{v.TipoAlerta?.tipoAlertaDescricao || '-'}</td>
                  <td style={{ padding: 12 }}>{v.Usuario?.usuarioNome || '-'}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <button onClick={() => { setEditandoAdminVinculo(v); setFormAdminVinculo({ tipoAlertaId: String(v.tipoAlertaId), usuarioId: String(v.usuarioId) }); }} style={btnEditIcon} title="Editar" aria-label="Editar"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm('Excluir?')) api.delete(`/notificacao/vinculos-usuario/${v.notificacaoUsuarioId}`).then(() => { carregar(); toast.success('Excluído.'); }); }} style={btnDeleteIcon} title="Excluir" aria-label="Excluir"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {adminVinculos.length === 0 && !loading && <EmptyState title="Nenhum vínculo" description="Selecione Notificação e Colaborador e clique em + para adicionar." />}
        </Card>
      )}

      {/* Consulta envios */}
      {submenu === 'consulta-envios' && (
        <Card>
          <h3 style={{ marginBottom: 16, color: 'var(--gx2-texto-secundario)' }}>Consulta de envios</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Notificação</label>
              <input type="text" value={filtroEnviosNotificacao} onChange={(e) => setFiltroEnviosNotificacao(e.target.value)} placeholder="" style={{ ...inputStyle, minWidth: 180 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Colaborador</label>
              <select value={filtroEnviosColaborador} onChange={(e) => setFiltroEnviosColaborador(e.target.value)} style={{ ...inputStyle, minWidth: 180 }}>
                <option value="">Selecione</option>
                {consultaEnviosUsuarios.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data do registro</label>
              <input type="date" value={filtroEnviosDataRegistro} onChange={(e) => setFiltroEnviosDataRegistro(e.target.value)} style={{ ...inputStyle, minWidth: 180 }} />
            </div>
            <Button onClick={carregar}>Pesquisar</Button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)', background: 'var(--gx2-cinza-100)' }}><th style={{ padding: 12, textAlign: 'left', color: 'var(--gx2-texto-secundario)' }}>Notificação</th><th style={{ padding: 12, textAlign: 'left', color: 'var(--gx2-texto-secundario)' }}>Colaborador</th><th style={{ padding: 12, textAlign: 'left', color: 'var(--gx2-texto-secundario)' }}>Data do registro</th></tr></thead>
            <tbody>
              {envios.map((e) => (
                <tr key={e.registroAvisoLogId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                  <td style={{ padding: 12 }}>{e.registroAvisoLogObservacao || '-'}</td>
                  <td style={{ padding: 12 }}>{e.Usuario?.usuarioNome || '-'}</td>
                  <td style={{ padding: 12 }}>{e.registroAvisoLogDataHora ? new Date(e.registroAvisoLogDataHora).toLocaleString('pt-BR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {envios.length === 0 && !loading && <EmptyState title="Nenhum registro encontrado" description="Ajuste os filtros e pesquise novamente." />}
        </Card>
      )}
    </div>
  );
}
