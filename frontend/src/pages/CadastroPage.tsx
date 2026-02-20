/**
 * Cadastro - Submenu e telas CRUD conforme sistema original GeneXus
 * Centro de Custo, Empresa, Equipe, Evento, Log, Projeto, Usuário,
 * Alterar Data de Referência, Exportar/Importar, Valor hora, Período de Fechamento
 */
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

type SubmenuId =
  | 'centro-custo' | 'empresa' | 'equipe' | 'evento' | 'log' | 'projeto' | 'usuario'
  | 'data-referencia' | 'exportar-importar' | 'valor-hora' | 'periodo-fechamento';

const SUBMENU: { id: SubmenuId; label: string }[] = [
  { id: 'centro-custo', label: 'Centro de Custo' },
  { id: 'empresa', label: 'Empresa' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'evento', label: 'Evento' },
  { id: 'log', label: 'Log' },
  { id: 'projeto', label: 'Projeto' },
  { id: 'usuario', label: 'Usuário' },
  { id: 'data-referencia', label: 'Alterar Data de Referência' },
  { id: 'exportar-importar', label: 'Exportar ou Importar Usuários e Gestor' },
  { id: 'valor-hora', label: 'Valor hora do usuário' },
  { id: 'periodo-fechamento', label: 'Período de Fechamento de Horas' },
];

const EVTIPO: Record<number, string> = {
  1: 'Feriado', 2: 'Férias', 3: 'Férias Coletivas', 4: 'Período Reduzido', 5: 'Outro', 6: 'Atestado',
};

const ABRANGENCIA: Record<number, string> = {
  1: 'Sistema', 2: 'Empresa', 3: 'Usuário',
};

const PERFIL: Record<number, string> = {
  1: 'Admin GX2', 2: 'Admin Empresa', 3: 'Coordenador', 4: 'Colaborador', 5: 'Gestão Projetos',
};

const STATUS_PROJETO: Record<string, string> = {
  R: 'Previsto', I: 'Aguardando Início', A: 'Em Andamento', P: 'Parado', E: 'Encerrado',
};

const TIPO_PROJETO: Record<string, string> = {
  O: 'Outsourcing', E: 'Labs Escopo Fechado', S: 'Labs Squad Gerenciada', C: 'Labs Concepção', U: 'Labs Sustentação', N: 'Labs Consultoria',
};

const TIPO_FATURAMENTO: Record<string, string> = {
  M: 'Mensal', S: 'Semanal', P: 'Por Projeto', H: 'Por Hora', O: 'Outro',
};

const SITUACAO_EMPRESA: Record<string, string> = {
  A: 'Ativa', I: 'Inativa',
};

const cardStyle = {
  padding: 20,
  background: 'var(--gx2-branco)',
  borderRadius: 'var(--radius-md)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
};

const inputStyle = { padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 'var(--radius-sm)', minWidth: 200 };
const acoesCellStyle = { display: 'flex', flexDirection: 'row' as const, gap: 8, padding: 12, alignItems: 'center', justifyContent: 'flex-end' };
const btnEditIcon = { width: 32, height: 32, borderRadius: '50%', background: 'var(--gx2-cinza-200)', color: 'var(--gx2-cinza-600)', border: 'none', cursor: 'pointer', display: 'inline-flex' as const, alignItems: 'center', justifyContent: 'center', marginRight: 4 };
const btnDeleteIcon = { width: 32, height: 32, borderRadius: '50%', background: 'transparent', color: 'var(--gx2-danger)', border: 'none', cursor: 'pointer', display: 'inline-flex' as const, alignItems: 'center', justifyContent: 'center' };
const thBase = { padding: 12, fontSize: 12, color: 'var(--gx2-texto-secundario)', borderBottom: '1px solid var(--gx2-cinza-200)' };

/** Input com estado local - evita perda de foco ao digitar (não re-renderiza o pai a cada tecla) */
function FormInput({ name, value, form, setForm, formRef, label }: { name: string; value: string; form: Record<string, unknown>; setForm: (f: Record<string, unknown>) => void; formRef?: React.MutableRefObject<Record<string, unknown>>; label: string }) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(String(value ?? '')); }, [value]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    if (formRef) formRef.current = { ...formRef.current, [name]: v };
  };
  const handleBlur = () => {
    setForm({ ...form, [name]: local });
    if (formRef) formRef.current = { ...formRef.current, [name]: local };
  };
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>{label}</label>
      <input
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{ ...inputStyle, width: '100%', maxWidth: 300 }}
      />
    </div>
  );
}

function TabelaCRUD({
  titulo,
  cols,
  dados,
  onExcluir,
  apiPath,
  camposNovo,
  editando,
  form,
  setEditando,
  setForm,
  carregar,
  abrirNovo,
  formRef,
}: {
  titulo: string;
  cols: { key: string; label: string; format?: (v: unknown) => unknown }[];
  dados: Record<string, unknown>[];
  onExcluir?: boolean;
  apiPath: string;
  camposNovo: Record<string, unknown>;
  editando: Record<string, unknown> | null;
  form: Record<string, unknown>;
  setEditando: (v: Record<string, unknown> | null) => void;
  setForm: (v: Record<string, unknown>) => void;
  carregar: () => void;
  abrirNovo: (campos: Record<string, unknown>) => void;
  formRef?: React.MutableRefObject<Record<string, unknown>>;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>{titulo}</h3>
        <Button type="button" variant="success" size="sm" onClick={() => abrirNovo(camposNovo || {})}>+ Novo</Button>
      </div>
      {editando && (
        <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
          {Object.entries(form)
            .filter(([k]) => !k.endsWith('Id') && k !== '__novo')
            .map(([k, v]) => (
              <FormInput
                key={k}
                name={k}
                value={String(v ?? '')}
                form={form}
                setForm={setForm}
                formRef={formRef}
                label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              />
            ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button type="button" variant="success" size="sm" onClick={async () => {
              try {
                const dadosEnvio = formRef ? { ...form, ...formRef.current } : form;
                const payload: Record<string, unknown> = {};
                for (const [k, v] of Object.entries(dadosEnvio)) {
                  if (k === '__novo' || k.endsWith('Id')) continue;
                  if (v !== undefined && v !== null) payload[k] = v;
                }
                if (editando[cols[0].key]) {
                  await api.put(`${apiPath}/${editando[cols[0].key]}`, payload);
                } else {
                  const descKey = cols.find((c) => c.key.includes('Descricao'))?.key;
                  if (descKey && (!payload[descKey] || String(payload[descKey]).trim() === '')) {
                    alert('Preencha a descrição.');
                    return;
                  }
                  await api.post(apiPath, payload);
                }
                setEditando(null);
                carregar();
              } catch (err: unknown) {
                const res = (err as { response?: { data?: { error?: string }; status?: number } })?.response;
                const msg = res?.data?.error || (res?.status === 404 ? 'Rota não encontrada. Verifique se o backend está rodando.' : 'Erro ao salvar');
                alert(msg);
              }
            }}>Salvar</Button>
            <Button type="button" variant="cancel" size="sm" onClick={() => setEditando(null)}>Cancelar</Button>
          </div>
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
            {cols.map((c) => <th key={c.key} style={{ ...thBase, textAlign: 'left' }}>{c.label}</th>)}
            <th style={{ ...thBase, textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((row) => (
            <tr key={String(row[cols[0].key])} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
              {cols.map((c) => <td key={c.key} style={{ padding: 12 }}>{c.format ? String(c.format(row[c.key]) ?? '') : String(row[c.key] ?? '')}</td>)}
              <td style={acoesCellStyle}>
                <button type="button" onClick={() => { setEditando(row); setForm(row); if (formRef) formRef.current = { ...row }; }} style={btnEditIcon} title="Editar">✎</button>
                {onExcluir && <button type="button" onClick={() => { if (confirm('Excluir?')) api.delete(`${apiPath}/${row[cols[0].key]}`).then(carregar); }} style={btnDeleteIcon} title="Excluir">🗑</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { TabelaCRUD };

export default function CadastroPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get('tab') || 'usuario') as SubmenuId;
  const validTab = SUBMENU.some((s) => s.id === tabFromUrl) ? tabFromUrl : 'usuario';
  const [submenu, setSubmenu] = useState<SubmenuId>(validTab);
  const [loading, setLoading] = useState(false);
  const [centrosCusto, setCentrosCusto] = useState<any[]>([]);
  const [filtroCentroCustoDescricao, setFiltroCentroCustoDescricao] = useState('');
  const [filtroCentroCustoCodigo, setFiltroCentroCustoCodigo] = useState('');
  const [filtroCentroCustoEmpresa, setFiltroCentroCustoEmpresa] = useState('');
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresasGrid, setEmpresasGrid] = useState<any[]>([]);
  const [filtroEmpresaDescricao, setFiltroEmpresaDescricao] = useState('');
  const [filtroEmpresaTipoFaturamento, setFiltroEmpresaTipoFaturamento] = useState('');
  const [filtroEmpresaSituacao, setFiltroEmpresaSituacao] = useState('');
  const [editandoEmpresa, setEditandoEmpresa] = useState<any>(null);
  const [formEmpresa, setFormEmpresa] = useState<Record<string, any>>({});
  const [equipes, setEquipes] = useState<any[]>([]);
  const [equipesGrid, setEquipesGrid] = useState<any[]>([]);
  const [filtroEquipeDescricao, setFiltroEquipeDescricao] = useState('');
  const [filtroEquipeEmpresa, setFiltroEquipeEmpresa] = useState('');
  const [eventos, setEventos] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const formRef = useRef<Record<string, unknown>>({});
  const [filtroLogDescricao, setFiltroLogDescricao] = useState('');
  const [filtroLogColaborador, setFiltroLogColaborador] = useState('');
  const [filtroLogData, setFiltroLogData] = useState('');
  const [filtroProjetoDescricao, setFiltroProjetoDescricao] = useState('');
  const [filtroProjetoEmpresa, setFiltroProjetoEmpresa] = useState('');
  const [filtroProjetoSituacao, setFiltroProjetoSituacao] = useState('');
  const [editandoProjeto, setEditandoProjeto] = useState<any>(null);
  const [formProjeto, setFormProjeto] = useState<Record<string, any>>({});
  const [projetoAdministradorIds, setProjetoAdministradorIds] = useState<number[]>([]);
  const [usuarioProjetos, setUsuarioProjetos] = useState<{ projetoId: number; projetoDescricao: string; tipo: 'H' | 'P'; valor: number }[]>([]);
  const [modalProjetosAberta, setModalProjetosAberta] = useState(false);
  const [modalProjetoSelecionados, setModalProjetoSelecionados] = useState<number[]>([]);
  const [modalProjetoTipo, setModalProjetoTipo] = useState<'H' | 'P'>('P');
  const [modalProjetoValor, setModalProjetoValor] = useState<number>(100);
  const fileFotoRef = useRef<HTMLInputElement>(null);
  const [filtroUsuarioNome, setFiltroUsuarioNome] = useState('');
  const [filtroUsuarioEmail, setFiltroUsuarioEmail] = useState('');
  const [filtroUsuarioPerfil, setFiltroUsuarioPerfil] = useState('');
  const [filtroUsuarioEmpresa, setFiltroUsuarioEmpresa] = useState('');
  const [filtroUsuarioEquipe, setFiltroUsuarioEquipe] = useState('');
  const [filtroUsuarioSituacao, setFiltroUsuarioSituacao] = useState('');
  const [editandoUsuario, setEditandoUsuario] = useState<any>(null);
  const [formUsuario, setFormUsuario] = useState<Record<string, any>>({});
  const [erroColaborador, setErroColaborador] = useState<string | null>(null);
  const [campoErroColaborador, setCampoErroColaborador] = useState<string | null>(null);
  const refLogin = useRef<HTMLInputElement>(null);
  const refNome = useRef<HTMLInputElement>(null);
  const refEmail = useRef<HTMLInputElement>(null);
  const [dataRefData, setDataRefData] = useState(() => new Date().toISOString().split('T')[0]);
  const [dataRefUsuario, setDataRefUsuario] = useState('');
  const [dataRefResultado, setDataRefResultado] = useState<string | null>(null);
  const [importArquivos, setImportArquivos] = useState<File[]>([]);
  const [importPreview, setImportPreview] = useState<{ nome: string; email: string; emailGestor: string }[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ criados: number; atualizados: number; total: number; erros?: string[] } | null>(null);
  const fileImportRef = useRef<HTMLInputElement>(null);
  const [valorHoraList, setValorHoraList] = useState<{ usuarioValorHoraId: number; usuarioId: number; usuarioNome: string; valorHoraData: string; valorHoraValor: number }[]>([]);
  const [filtroValorHoraColaborador, setFiltroValorHoraColaborador] = useState('');
  const [filtroValorHoraData, setFiltroValorHoraData] = useState('');
  const [filtroValorHoraDe, setFiltroValorHoraDe] = useState('');
  const [filtroValorHoraAte, setFiltroValorHoraAte] = useState('');
  const [editandoValorHora, setEditandoValorHora] = useState<{ usuarioValorHoraId?: number; usuarioId?: number; usuarioNome?: string; valorHoraData?: string; valorHoraValor?: number } | null>(null);
  const [formValorHora, setFormValorHora] = useState<{ usuarioId: string; valorHoraData: string; valorHoraValor: string }>({ usuarioId: '', valorHoraData: new Date().toISOString().split('T')[0], valorHoraValor: '' });
  const [periodoFechamento, setPeriodoFechamento] = useState<Record<string, string>>({});

  useEffect(() => {
    setSubmenu(validTab);
    setEditando(null);
    setForm({});
    setEditandoProjeto(null);
    setEditandoEmpresa(null);
    setEditandoUsuario(null);
    setEditandoValorHora(null);
    setErroColaborador(null);
    setCampoErroColaborador(null);
    setDataRefResultado(null);
    setImportArquivos([]);
    setImportPreview([]);
    setImportResult(null);
    formRef.current = {};
  }, [validTab]);

  const carregar = () => {
    setLoading(true);
    Promise.all([
      api.get('/centros-custo', { params: { descricao: filtroCentroCustoDescricao || undefined, codigo: filtroCentroCustoCodigo || undefined, empresa: filtroCentroCustoEmpresa || undefined } }).then((r) => setCentrosCusto(r.data)),
      api.get('/empresas').then((r) => setEmpresas(r.data)),
      submenu === 'empresa' ? api.get('/empresas', { params: { descricao: filtroEmpresaDescricao || undefined, tipoFaturamento: filtroEmpresaTipoFaturamento || undefined, situacao: filtroEmpresaSituacao || undefined } }).then((r) => setEmpresasGrid(r.data)) : Promise.resolve(),
      api.get('/equipes').then((r) => setEquipes(r.data)),
      submenu === 'equipe' ? api.get('/equipes', { params: { descricao: filtroEquipeDescricao || undefined, empresa: filtroEquipeEmpresa || undefined } }).then((r) => setEquipesGrid(r.data)) : Promise.resolve(),
      api.get('/eventos').then((r) => setEventos(r.data)),
      api.get('/logs', { params: { descricao: filtroLogDescricao || undefined, colaborador: filtroLogColaborador || undefined, data: filtroLogData || undefined } }).then((r) => setLogs(r.data)),
      api.get('/projetos', { params: { todos: 1, descricao: filtroProjetoDescricao || undefined, empresa: filtroProjetoEmpresa || undefined, situacao: filtroProjetoSituacao || undefined } }).then((r) => setProjetos(r.data)),
      api.get('/usuarios', { params: { todos: 1, nome: filtroUsuarioNome || undefined, email: filtroUsuarioEmail || undefined, perfil: filtroUsuarioPerfil || undefined, empresa: filtroUsuarioEmpresa || undefined, equipe: filtroUsuarioEquipe || undefined, situacao: filtroUsuarioSituacao || undefined } }).then((r) => setUsuarios(r.data)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [submenu]);
  useEffect(() => { if (submenu === 'valor-hora') carregarValorHora(); }, [submenu]);
  useEffect(() => { if (submenu === 'periodo-fechamento') api.get('/cadastro/periodo-fechamento').then((r) => setPeriodoFechamento(r.data || {})); }, [submenu]);

  const carregarValorHora = () => {
    setLoading(true);
    api.get('/cadastro/valor-hora', { params: { nome: filtroValorHoraColaborador || undefined, data: filtroValorHoraData || undefined, valorMin: filtroValorHoraDe || undefined, valorMax: filtroValorHoraAte || undefined } })
      .then((r) => setValorHoraList(r.data))
      .finally(() => setLoading(false));
  };

  const abrirNovo = (camposNovo: Record<string, unknown>) => {
    const novoForm = { ...camposNovo };
    setEditando({ __novo: true });
    setForm(novoForm);
    formRef.current = novoForm;
  };

  return (
    <div>
        {submenu === 'centro-custo' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3>Centro de Custo</h3>
              <Button type="button" variant="success" size="sm" onClick={() => abrirNovo({ centroCustoDescricao: '', centroCustoEmpresaId: '' })}>+ Novo</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Descrição</label>
                <input type="text" value={filtroCentroCustoDescricao} onChange={(e) => setFiltroCentroCustoDescricao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && carregar()} placeholder="Filtrar por descrição" style={{ ...inputStyle, minWidth: 180 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Código</label>
                <input type="text" value={filtroCentroCustoCodigo} onChange={(e) => setFiltroCentroCustoCodigo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && carregar()} placeholder="Filtrar por código" style={{ ...inputStyle, minWidth: 100 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Empresa</label>
                <select value={filtroCentroCustoEmpresa} onChange={(e) => setFiltroCentroCustoEmpresa(e.target.value)} style={{ ...inputStyle, minWidth: 180 }}>
                  <option value="">Todas</option>
                  {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                </select>
              </div>
              <Button type="button" variant="success" size="sm" onClick={carregar}>Filtrar</Button>
            </div>
            {editando && (editando.__novo || editando.centroCustoId) && (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 500 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Descrição</label>
                    <input value={String(form.centroCustoDescricao ?? '')} onChange={(e) => setForm({ ...form, centroCustoDescricao: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Empresa</label>
                    <select value={form.centroCustoEmpresaId ?? ''} onChange={(e) => setForm({ ...form, centroCustoEmpresaId: e.target.value ? Number(e.target.value) : '' })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button type="button" variant="success" size="sm" onClick={async () => {
                    try {
                      const descricao = String(form.centroCustoDescricao ?? '').trim();
                      if (!descricao) { alert('Preencha a descrição.'); return; }
                      const payload = { centroCustoDescricao: descricao, centroCustoEmpresaId: form.centroCustoEmpresaId ?? '' };
                      if (editando.centroCustoId) await api.put(`/centros-custo/${editando.centroCustoId}`, payload);
                      else await api.post('/centros-custo', payload);
                      setEditando(null);
                      carregar();
                    } catch (err: unknown) {
                      const res = (err as { response?: { data?: { error?: string } } })?.response;
                      alert(res?.data?.error || 'Erro ao salvar');
                    }
                  }}>Salvar</Button>
                  <Button type="button" variant="cancel" size="sm" onClick={() => setEditando(null)}>Cancelar</Button>
                </div>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                  <th style={{ ...thBase, textAlign: 'left' }}>Código</th>
                  <th style={{ ...thBase, textAlign: 'left' }}>Descrição</th>
                  <th style={{ ...thBase, textAlign: 'left' }}>Empresa</th>
                  <th style={{ ...thBase, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {centrosCusto.map((row) => (
                  <tr key={String(row.centroCustoId)} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                    <td style={{ padding: 12 }}>{row.centroCustoId}</td>
                    <td style={{ padding: 12 }}>{row.centroCustoDescricao}</td>
                    <td style={{ padding: 12 }}>{row.empresaDescricao ?? '-'}</td>
                    <td style={acoesCellStyle}>
                      <button type="button" onClick={() => { setEditando(row); setForm(row); if (formRef) formRef.current = { ...row }; }} style={btnEditIcon} title="Editar">✎</button>
                      <button type="button" onClick={() => { if (confirm('Excluir?')) api.delete(`/centros-custo/${row.centroCustoId}`).then(carregar); }} style={btnDeleteIcon} title="Excluir">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {centrosCusto.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)' }}>Nenhum centro de custo encontrado</p>}
          </div>
        )}
        {submenu === 'empresa' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3>Empresas</h3>
              <Button type="button" variant="success" size="sm" onClick={() => { setEditandoEmpresa({}); setFormEmpresa({ empresaDescricao: '', empresaTipoFaturamento: '', empresaSituacao: 'A' }); }}>+ Nova</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Descrição</label>
                <input type="text" value={filtroEmpresaDescricao} onChange={(e) => setFiltroEmpresaDescricao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && carregar()} placeholder="Filtrar por descrição" style={{ ...inputStyle, minWidth: 180 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Tipo de Faturamento</label>
                <select value={filtroEmpresaTipoFaturamento} onChange={(e) => setFiltroEmpresaTipoFaturamento(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                  <option value="">Todos</option>
                  {Object.entries(TIPO_FATURAMENTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Situação</label>
                <select value={filtroEmpresaSituacao} onChange={(e) => setFiltroEmpresaSituacao(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
                  <option value="">Todas</option>
                  {Object.entries(SITUACAO_EMPRESA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <Button type="button" variant="success" size="sm" onClick={carregar}>Filtrar</Button>
            </div>
            {editandoEmpresa && (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, maxWidth: 600 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Descrição</label>
                    <input value={String(formEmpresa.empresaDescricao ?? '')} onChange={(e) => setFormEmpresa({ ...formEmpresa, empresaDescricao: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Tipo de Faturamento</label>
                    <select value={formEmpresa.empresaTipoFaturamento ?? ''} onChange={(e) => setFormEmpresa({ ...formEmpresa, empresaTipoFaturamento: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {Object.entries(TIPO_FATURAMENTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Situação</label>
                    <select value={formEmpresa.empresaSituacao ?? 'A'} onChange={(e) => setFormEmpresa({ ...formEmpresa, empresaSituacao: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                      {Object.entries(SITUACAO_EMPRESA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button type="button" variant="success" size="sm" onClick={async () => {
                    try {
                      const descricao = String(formEmpresa.empresaDescricao ?? '').trim();
                      if (!descricao) { alert('Preencha a descrição.'); return; }
                      const payload = { empresaDescricao: descricao, empresaTipoFaturamento: formEmpresa.empresaTipoFaturamento || undefined, empresaSituacao: formEmpresa.empresaSituacao || 'A' };
                      if (editandoEmpresa.empresaId) await api.put(`/empresas/${editandoEmpresa.empresaId}`, payload);
                      else await api.post('/empresas', payload);
                      setEditandoEmpresa(null);
                      carregar();
                    } catch (err: unknown) {
                      const res = (err as { response?: { data?: { error?: string } } })?.response;
                      alert(res?.data?.error || 'Erro ao salvar');
                    }
                  }}>Salvar</Button>
                  <Button type="button" variant="cancel" size="sm" onClick={() => setEditandoEmpresa(null)}>Cancelar</Button>
                </div>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                  <th style={{ ...thBase, textAlign: 'left' }}>Código</th>
                  <th style={{ ...thBase, textAlign: 'left' }}>Descrição</th>
                  <th style={{ ...thBase, textAlign: 'left' }}>Tipo Faturamento</th>
                  <th style={{ ...thBase, textAlign: 'left' }}>Situação</th>
                  <th style={{ ...thBase, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {empresasGrid.map((row) => (
                  <tr key={String(row.empresaId)} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                    <td style={{ padding: 12 }}>{row.empresaId}</td>
                    <td style={{ padding: 12 }}>{row.empresaDescricao}</td>
                    <td style={{ padding: 12 }}>{TIPO_FATURAMENTO[row.empresaTipoFaturamento] ?? row.empresaTipoFaturamento ?? '-'}</td>
                    <td style={{ padding: 12 }}>{SITUACAO_EMPRESA[row.empresaSituacao] ?? row.empresaSituacao ?? '-'}</td>
                    <td style={acoesCellStyle}>
                      <button type="button" onClick={() => { setEditandoEmpresa(row); setFormEmpresa(row); }} style={btnEditIcon} title="Editar">✎</button>
                      <button type="button" onClick={() => { if (confirm('Excluir?')) api.delete(`/empresas/${row.empresaId}`).then(carregar); }} style={btnDeleteIcon} title="Excluir">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {empresasGrid.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)' }}>Nenhuma empresa encontrada</p>}
          </div>
        )}
        {submenu === 'equipe' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3>Equipe</h3>
              <Button type="button" variant="success" size="sm" onClick={() => abrirNovo({ equipeDescricao: '', equipeEmpresaId: '' })}>+ Nova</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Equipe</label>
                <input type="text" value={filtroEquipeDescricao} onChange={(e) => setFiltroEquipeDescricao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && carregar()} placeholder="Filtrar por equipe" style={{ ...inputStyle, minWidth: 180 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Empresa</label>
                <select value={filtroEquipeEmpresa} onChange={(e) => setFiltroEquipeEmpresa(e.target.value)} style={{ ...inputStyle, minWidth: 180 }}>
                  <option value="">Todas</option>
                  {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                </select>
              </div>
              <Button type="button" variant="success" size="sm" onClick={carregar}>Filtrar</Button>
            </div>
            {editando && (editando.__novo || editando.equipeId) && (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 500 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Equipe</label>
                    <input value={String(form.equipeDescricao ?? '')} onChange={(e) => setForm({ ...form, equipeDescricao: e.target.value })} style={{ ...inputStyle, width: '100%' }} placeholder="Nome da equipe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Empresa</label>
                    <select value={form.equipeEmpresaId ?? ''} onChange={(e) => setForm({ ...form, equipeEmpresaId: e.target.value ? Number(e.target.value) : '' })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button type="button" variant="success" size="sm" onClick={async () => {
                    try {
                      const descricao = String(form.equipeDescricao ?? '').trim();
                      if (!descricao) { alert('Preencha a equipe.'); return; }
                      const payload = { equipeDescricao: descricao, equipeEmpresaId: form.equipeEmpresaId ?? '' };
                      if (editando.equipeId) await api.put(`/equipes/${editando.equipeId}`, payload);
                      else await api.post('/equipes', payload);
                      setEditando(null);
                      carregar();
                    } catch (err: unknown) {
                      const res = (err as { response?: { data?: { error?: string } } })?.response;
                      alert(res?.data?.error || 'Erro ao salvar');
                    }
                  }}>Salvar</Button>
                  <Button type="button" variant="cancel" size="sm" onClick={() => setEditando(null)}>Cancelar</Button>
                </div>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                  <th style={{ ...thBase, textAlign: 'left' }}>ID</th>
                  <th style={{ ...thBase, textAlign: 'left' }}>Equipe</th>
                  <th style={{ ...thBase, textAlign: 'left' }}>Empresa</th>
                  <th style={{ ...thBase, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {equipesGrid.map((row) => (
                  <tr key={String(row.equipeId)} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                    <td style={{ padding: 12 }}>{row.equipeId}</td>
                    <td style={{ padding: 12 }}>{row.equipeDescricao}</td>
                    <td style={{ padding: 12 }}>{row.empresaDescricao ?? '-'}</td>
                    <td style={acoesCellStyle}>
                      <button type="button" onClick={() => { setEditando(row); setForm(row); if (formRef) formRef.current = { ...row }; }} style={btnEditIcon} title="Editar">✎</button>
                      <button type="button" onClick={() => { if (confirm('Excluir?')) api.delete(`/equipes/${row.equipeId}`).then(carregar); }} style={btnDeleteIcon} title="Excluir">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {equipesGrid.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)' }}>Nenhuma equipe encontrada</p>}
          </div>
        )}
        {submenu === 'evento' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3>Eventos</h3>
              <Button type="button" variant="success" size="sm" onClick={() => { setEditando({}); setForm({ eventoDescricao: '', eventoTipo: 1, eventoAbrangencia: 1, eventoDiaInteiro: true, eventoData: new Date().toISOString().split('T')[0], eventoDataFinal: new Date().toISOString().split('T')[0] }); }}>+ Novo</Button>
            </div>
            {editando && (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 600 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Descrição</label>
                    <input value={form.eventoDescricao || ''} onChange={(e) => setForm({ ...form, eventoDescricao: e.target.value })} style={{ ...inputStyle, width: '100%' }} placeholder="Ex: Feriado Nacional" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data início</label>
                    <input type="date" value={(form.eventoData ? String(form.eventoData).slice(0, 10) : '') || new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, eventoData: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data fim</label>
                    <input type="date" value={(form.eventoDataFinal ? String(form.eventoDataFinal).slice(0, 10) : '') || new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, eventoDataFinal: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Tipo</label>
                    <select value={form.eventoTipo || 1} onChange={(e) => setForm({ ...form, eventoTipo: Number(e.target.value) })} style={{ ...inputStyle, width: '100%' }}>
                      {Object.entries(EVTIPO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Abrangência</label>
                    <select value={form.eventoAbrangencia ?? 1} onChange={(e) => setForm({ ...form, eventoAbrangencia: Number(e.target.value) })} style={{ ...inputStyle, width: '100%' }}>
                      {Object.entries(ABRANGENCIA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
                    <input type="checkbox" id="eventoDiaInteiro" checked={form.eventoDiaInteiro !== false} onChange={(e) => setForm({ ...form, eventoDiaInteiro: e.target.checked })} />
                    <label htmlFor="eventoDiaInteiro" style={{ cursor: 'pointer', fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Dia inteiro</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button type="button" variant="success" size="sm" onClick={async () => {
                    try {
                      if (!form.eventoDescricao || String(form.eventoDescricao).trim() === '') {
                        toast.error('Preencha a descrição.');
                        return;
                      }
                      const dataStr = form.eventoData ? String(form.eventoData).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1').slice(0, 10) : new Date().toISOString().slice(0, 10);
                      const dataFinalStr = form.eventoDataFinal ? String(form.eventoDataFinal).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1').slice(0, 10) : dataStr;
                      const payload = { ...form, eventoData: dataStr, eventoDataFinal: dataFinalStr, eventoAbrangencia: form.eventoAbrangencia ?? 1, eventoDiaInteiro: form.eventoDiaInteiro !== false };
                      if (editando.eventoId) await api.put(`/eventos/${editando.eventoId}`, payload);
                      else await api.post('/eventos', payload);
                      setEditando(null);
                      carregar();
                      toast.success('Evento salvo.');
                    } catch (err: unknown) {
                      const res = (err as { response?: { data?: { error?: string } } })?.response;
                      toast.error(res?.data?.error || 'Erro ao salvar evento');
                    }
                  }}>Salvar</Button>
                  <Button type="button" variant="cancel" size="sm" onClick={() => setEditando(null)}>Cancelar</Button>
                </div>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}><th style={thBase}>Data</th><th style={thBase}>Descrição</th><th style={thBase}>Tipo</th><th style={thBase}>Abrangência</th><th style={{ ...thBase, textAlign: 'right' }}>Ações</th></tr></thead>
              <tbody>
                {eventos.map((e) => (
                  <tr key={e.eventoId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                    <td style={{ padding: 12 }}>{new Date(e.eventoData).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: 12 }}>{e.eventoDescricao}</td>
                    <td style={{ padding: 12 }}>{EVTIPO[e.eventoTipo] || e.eventoTipo}</td>
                    <td style={{ padding: 12 }}>{ABRANGENCIA[e.eventoAbrangencia] ?? e.eventoAbrangencia ?? '-'}</td>
                    <td style={acoesCellStyle}>
                      <button type="button" onClick={() => { setEditando(e); setForm(e); }} style={btnEditIcon} title="Editar" aria-label="Editar"><Pencil size={16} /></button>
                      <button type="button" onClick={() => { if (confirm('Excluir?')) api.delete(`/eventos/${e.eventoId}`).then(() => { carregar(); toast.success('Excluído.'); }); }} style={btnDeleteIcon} title="Excluir" aria-label="Excluir"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {eventos.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)' }}>Nenhum evento encontrado</p>}
          </div>
        )}
        {submenu === 'log' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: 16 }}>Log de Avisos</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Descrição</label>
                <input
                  type="text"
                  value={filtroLogDescricao}
                  onChange={(e) => setFiltroLogDescricao(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && carregar()}
                  placeholder="Filtrar por descrição"
                  style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4, minWidth: 180 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Colaborador</label>
                <select
                  value={filtroLogColaborador}
                  onChange={(e) => setFiltroLogColaborador(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4, minWidth: 180 }}
                >
                  <option value="">Todos</option>
                  {usuarios.map((u) => (
                    <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data</label>
                <input
                  type="date"
                  value={filtroLogData}
                  onChange={(e) => setFiltroLogData(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--gx2-cinza-300)', borderRadius: 4 }}
                />
              </div>
              <Button variant="success" size="sm" onClick={carregar}>Filtrar</Button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thBase}>Data/Hora</th>
                  <th style={thBase}>Colaborador</th>
                  <th style={thBase}>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.registroAvisoLogId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                    <td style={{ padding: 12 }}>{new Date(l.registroAvisoLogDataHora).toLocaleString('pt-BR')}</td>
                    <td style={{ padding: 12 }}>{l.Usuario?.usuarioNome || '-'}</td>
                    <td style={{ padding: 12 }}>{l.registroAvisoLogObservacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)' }}>Nenhum registro</p>}
          </div>
        )}
        {submenu === 'projeto' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3>Projetos</h3>
              <Button type="button" variant="success" size="sm" onClick={() => { setEditandoProjeto({}); setFormProjeto({ projetoDescricao: '', projetoEmpresaId: '', centroCustoId: '', projetoValorHora: 0, projetoAtivo: true, projetoStatus: 'A', projetoDataInicio: '', projetoDataFim: '', projetoTipo: '', projetoDefault: false, projetoComentarioObrigatorio: false, projetoAtividadeObrigatoria: false, projetoEquipeId: '' }); setProjetoAdministradorIds([]); }}>+ Novo</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Descrição</label>
                <input type="text" value={filtroProjetoDescricao} onChange={(e) => setFiltroProjetoDescricao(e.target.value)} placeholder="Filtrar" style={{ ...inputStyle, minWidth: 160 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Empresa</label>
                <select value={filtroProjetoEmpresa} onChange={(e) => setFiltroProjetoEmpresa(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                  <option value="">Todas</option>
                  {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Status</label>
                <select value={filtroProjetoSituacao} onChange={(e) => setFiltroProjetoSituacao(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                  <option value="">Todos</option>
                  {Object.entries(STATUS_PROJETO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <Button type="button" variant="success" size="sm" onClick={carregar}>Filtrar</Button>
            </div>
            {editandoProjeto && (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 700 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Descrição</label>
                    <input value={formProjeto.projetoDescricao || ''} onChange={(e) => setFormProjeto({ ...formProjeto, projetoDescricao: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Empresa</label>
                    <select value={formProjeto.projetoEmpresaId ?? ''} onChange={(e) => setFormProjeto({ ...formProjeto, projetoEmpresaId: e.target.value ? Number(e.target.value) : '' })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Centro de Custo</label>
                    <select value={formProjeto.centroCustoId ?? ''} onChange={(e) => setFormProjeto({ ...formProjeto, centroCustoId: e.target.value ? Number(e.target.value) : '' })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {centrosCusto.map((c) => <option key={c.centroCustoId} value={c.centroCustoId}>{c.centroCustoDescricao}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Equipe</label>
                    <select value={formProjeto.projetoEquipeId ?? ''} onChange={(e) => setFormProjeto({ ...formProjeto, projetoEquipeId: e.target.value ? Number(e.target.value) : '' })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {equipes.map((eq) => <option key={eq.equipeId} value={eq.equipeId}>{eq.equipeDescricao}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data início</label>
                    <input type="date" value={(formProjeto.projetoDataInicio ? String(formProjeto.projetoDataInicio).slice(0, 10) : '')} onChange={(e) => setFormProjeto({ ...formProjeto, projetoDataInicio: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data fim</label>
                    <input type="date" value={(formProjeto.projetoDataFim ? String(formProjeto.projetoDataFim).slice(0, 10) : '')} onChange={(e) => setFormProjeto({ ...formProjeto, projetoDataFim: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Status</label>
                    <select value={formProjeto.projetoStatus ?? 'A'} onChange={(e) => setFormProjeto({ ...formProjeto, projetoStatus: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                      {Object.entries(STATUS_PROJETO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Tipo</label>
                    <select value={formProjeto.projetoTipo ?? ''} onChange={(e) => setFormProjeto({ ...formProjeto, projetoTipo: e.target.value || '' })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {Object.entries(TIPO_PROJETO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Valor/hora (R$)</label>
                    <input type="number" step="0.01" value={formProjeto.projetoValorHora ?? 0} onChange={(e) => setFormProjeto({ ...formProjeto, projetoValorHora: Number(e.target.value) || 0 })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={formProjeto.projetoAtivo ?? true} onChange={(e) => setFormProjeto({ ...formProjeto, projetoAtivo: e.target.checked })} />
                      Ativo
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={formProjeto.projetoDefault === true} onChange={(e) => setFormProjeto({ ...formProjeto, projetoDefault: e.target.checked })} />
                      Default
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={formProjeto.projetoComentarioObrigatorio === true} onChange={(e) => setFormProjeto({ ...formProjeto, projetoComentarioObrigatorio: e.target.checked })} />
                      Comentário obrigatório
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={formProjeto.projetoAtividadeObrigatoria === true} onChange={(e) => setFormProjeto({ ...formProjeto, projetoAtividadeObrigatoria: e.target.checked })} />
                      Atividade obrigatória
                    </label>
                  </div>
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gx2-cinza-200)' }}>
                  <h4 style={{ marginBottom: 12, fontSize: 14 }}>Administrador</h4>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <select value="" onChange={(e) => { const v = e.target.value; if (v) setProjetoAdministradorIds([...projetoAdministradorIds, Number(v)]); e.target.value = ''; }} style={{ ...inputStyle, minWidth: 200 }}>
                      <option value="">— Adicionar usuário —</option>
                      {usuarios.filter((u) => !projetoAdministradorIds.includes(u.usuarioId)).map((u) => (
                        <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {projetoAdministradorIds.map((uid) => {
                      const u = usuarios.find((x) => x.usuarioId === uid);
                      return u ? (
                        <span key={uid} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'var(--gx2-cinza-200)', borderRadius: 4, fontSize: 13 }}>
                          {u.usuarioNome}
                          <button type="button" onClick={() => setProjetoAdministradorIds(projetoAdministradorIds.filter((id) => id !== uid))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
                        </span>
                      ) : null;
                    })}
                    {projetoAdministradorIds.length === 0 && <span style={{ color: 'var(--gx2-cinza-500)', fontSize: 13 }}>Nenhum administrador selecionado</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button type="button" variant="success" size="sm" onClick={async () => {
                    try {
                      const payload = { ...formProjeto, projetoEmpresaId: formProjeto.projetoEmpresaId || empresas[0]?.empresaId };
                      if (editandoProjeto.projetoId) await api.put(`/projetos/${editandoProjeto.projetoId}`, payload);
                      else await api.post('/projetos', payload);
                      setEditandoProjeto(null);
                      carregar();
                    } catch (err: unknown) {
                      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao salvar');
                    }
                  }}>Salvar</Button>
                  <Button type="button" variant="cancel" size="sm" onClick={() => setEditandoProjeto(null)}>Cancelar</Button>
                </div>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                  <th style={thBase}>Descrição</th>
                  <th style={thBase}>Empresa</th>
                  <th style={thBase}>Centro Custo</th>
                  <th style={thBase}>Status</th>
                  <th style={thBase}>Tipo</th>
                  <th style={thBase}>Valor/hora</th>
                  <th style={{ ...thBase, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {projetos.map((p) => (
                  <tr key={p.projetoId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                    <td style={{ padding: 12 }}>{p.projetoDescricao}</td>
                    <td style={{ padding: 12 }}>{p.Empresa?.empresaDescricao || '-'}</td>
                    <td style={{ padding: 12 }}>{p.CentroCusto?.centroCustoDescricao || '-'}</td>
                    <td style={{ padding: 12 }}>{STATUS_PROJETO[p.projetoStatus] || p.projetoStatus}</td>
                    <td style={{ padding: 12 }}>{TIPO_PROJETO[p.projetoTipo] ?? p.projetoTipo ?? '-'}</td>
                    <td style={{ padding: 12 }}>R$ {Number(p.projetoValorHora || 0).toFixed(2)}</td>
                    <td style={acoesCellStyle}>
                      <button type="button" onClick={() => { setEditandoProjeto(p); setFormProjeto({ ...p, projetoEmpresaId: p.projetoEmpresaId, centroCustoId: p.centroCustoId ?? '', projetoDataInicio: p.projetoDataInicio ? String(p.projetoDataInicio).slice(0, 10) : '', projetoDataFim: p.projetoDataFim ? String(p.projetoDataFim).slice(0, 10) : '', projetoTipo: p.projetoTipo ?? '', projetoDefault: p.projetoDefault ?? false, projetoComentarioObrigatorio: p.projetoComentarioObrigatorio ?? false, projetoAtividadeObrigatoria: p.projetoAtividadeObrigatoria ?? false, projetoEquipeId: p.projetoEquipeId ?? '' }); setProjetoAdministradorIds([]); }} style={btnEditIcon} title="Editar">✎</button>
                      <button type="button" onClick={() => { if (confirm('Excluir este projeto?')) api.delete(`/projetos/${p.projetoId}`).then(carregar); }} style={btnDeleteIcon} title="Excluir">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {projetos.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)' }}>Nenhum projeto</p>}
          </div>
        )}
        {submenu === 'usuario' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3>Usuários</h3>
              <Button type="button" variant="success" size="sm" onClick={() => { setEditandoUsuario({}); const hoje = new Date().toISOString().split('T')[0]; setFormUsuario({ usuarioLogin: '', usuarioNome: '', usuarioEmail: '', usuarioSenha: '', usuarioPerfil: 4, usuarioCargaHoraria: 44, usuarioAtivo: true, usuarioEmailGestor: '', usuarioDataEntrada: hoje, usuarioDataSaida: '', usuarioReferenciaData: hoje, usuarioAvisosAtivo: false, usuarioObrigatorioComentario: false, usuarioTravaApontamento: false, usuarioTotalHorasMensais: 176, usuarioHoraPrevistaChegada: '08:00', usuarioHoraPrevistaSaida: '18:00', usuarioHoraPrevistaAlmocoSaida: '12:00', usuarioHoraPrevistaAlmocoChegada: '13:00' }); setUsuarioProjetos([]); setErroColaborador(null); setCampoErroColaborador(null); }}>+ Novo</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Nome</label>
                <input type="text" value={filtroUsuarioNome} onChange={(e) => setFiltroUsuarioNome(e.target.value)} placeholder="Filtrar" style={{ ...inputStyle, minWidth: 140 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>E-mail</label>
                <input type="text" value={filtroUsuarioEmail} onChange={(e) => setFiltroUsuarioEmail(e.target.value)} placeholder="Filtrar" style={{ ...inputStyle, minWidth: 140 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Perfil</label>
                <select value={filtroUsuarioPerfil} onChange={(e) => setFiltroUsuarioPerfil(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
                  <option value="">Todos</option>
                  {Object.entries(PERFIL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Empresa</label>
                <select value={filtroUsuarioEmpresa} onChange={(e) => setFiltroUsuarioEmpresa(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
                  <option value="">Todas</option>
                  {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Equipe</label>
                <select value={filtroUsuarioEquipe} onChange={(e) => setFiltroUsuarioEquipe(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
                  <option value="">Todas</option>
                  {equipes.map((e) => <option key={e.equipeId} value={e.equipeId}>{e.equipeDescricao}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Situação</label>
                <select value={filtroUsuarioSituacao} onChange={(e) => setFiltroUsuarioSituacao(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
                  <option value="">Todas</option>
                  <option value="A">Ativo</option>
                  <option value="I">Inativo</option>
                </select>
              </div>
              <Button type="button" variant="success" size="sm" onClick={carregar}>Filtrar</Button>
            </div>
            {editandoUsuario && (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
                {erroColaborador && (
                  <div style={{ marginBottom: 16, padding: 12, background: 'var(--gx2-danger-bg)', border: '1px solid var(--gx2-danger)', borderRadius: 6, color: 'var(--gx2-danger)', fontSize: 14 }}>
                    {erroColaborador}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 700 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Login</label>
                    <input ref={refLogin} value={formUsuario.usuarioLogin || ''} onChange={(e) => { setFormUsuario({ ...formUsuario, usuarioLogin: e.target.value }); setErroColaborador(null); }} style={{ ...inputStyle, width: '100%', borderColor: campoErroColaborador === 'usuarioLogin' ? 'var(--gx2-danger)' : undefined }} placeholder="Ex: user01" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Nome</label>
                    <input ref={refNome} value={formUsuario.usuarioNome || ''} onChange={(e) => { setFormUsuario({ ...formUsuario, usuarioNome: e.target.value }); setErroColaborador(null); }} style={{ ...inputStyle, width: '100%', borderColor: campoErroColaborador === 'usuarioNome' ? 'var(--gx2-danger)' : undefined }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>E-mail</label>
                    <input ref={refEmail} type="email" value={formUsuario.usuarioEmail || ''} onChange={(e) => { setFormUsuario({ ...formUsuario, usuarioEmail: e.target.value }); setErroColaborador(null); }} style={{ ...inputStyle, width: '100%', borderColor: campoErroColaborador === 'usuarioEmail' ? 'var(--gx2-danger)' : undefined }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>E-mail do gestor</label>
                    <input type="email" value={formUsuario.usuarioEmailGestor || ''} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioEmailGestor: e.target.value })} style={{ ...inputStyle, width: '100%' }} placeholder="E-mail do gestor" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Senha {formUsuario.usuarioId ? '(deixe vazio para manter)' : ''}</label>
                    <input type="password" value={formUsuario.usuarioSenha || ''} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioSenha: e.target.value })} style={{ ...inputStyle, width: '100%' }} placeholder={formUsuario.usuarioId ? '' : 'Obrigatório'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Perfil</label>
                    <select value={formUsuario.usuarioPerfil ?? 4} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioPerfil: Number(e.target.value) })} style={{ ...inputStyle, width: '100%' }}>
                      {Object.entries(PERFIL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data de entrada</label>
                    <input type="date" value={(formUsuario.usuarioDataEntrada ? String(formUsuario.usuarioDataEntrada).slice(0, 10) : '') || new Date().toISOString().split('T')[0]} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioDataEntrada: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data de saída</label>
                    <input type="date" value={formUsuario.usuarioDataSaida ? String(formUsuario.usuarioDataSaida).slice(0, 10) : ''} onChange={(e) => { const v = e.target.value; setFormUsuario({ ...formUsuario, usuarioDataSaida: v, usuarioAtivo: !v || v >= new Date().toISOString().split('T')[0] }); }} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data de Referência de Apontamento</label>
                    <input type="date" value={formUsuario.usuarioReferenciaData ? String(formUsuario.usuarioReferenciaData).slice(0, 10) : new Date().toISOString().split('T')[0]} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioReferenciaData: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Carga horária (h)</label>
                    <input type="number" step="0.01" value={formUsuario.usuarioCargaHoraria ?? 44} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioCargaHoraria: Number(e.target.value) || 0 })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Total de horas permitidas no mês</label>
                    <input type="number" step="0.01" value={formUsuario.usuarioTotalHorasMensais ?? 176} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioTotalHorasMensais: Number(e.target.value) || 0 })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Empresa</label>
                    <select value={formUsuario.usuarioEmpresaId ?? ''} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioEmpresaId: e.target.value ? Number(e.target.value) : undefined })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {empresas.map((e) => <option key={e.empresaId} value={e.empresaId}>{e.empresaDescricao}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Equipe</label>
                    <select value={formUsuario.equipeId ?? ''} onChange={(e) => setFormUsuario({ ...formUsuario, equipeId: e.target.value ? Number(e.target.value) : undefined })} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {equipes.map((e) => <option key={e.equipeId} value={e.equipeId}>{e.equipeDescricao}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Chegada prevista</label>
                    <input type="time" value={formUsuario.usuarioHoraPrevistaChegada || '08:00'} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioHoraPrevistaChegada: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Saída prevista</label>
                    <input type="time" value={formUsuario.usuarioHoraPrevistaSaida || '18:00'} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioHoraPrevistaSaida: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Saída almoço prevista</label>
                    <input type="time" value={formUsuario.usuarioHoraPrevistaAlmocoSaida || '12:00'} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioHoraPrevistaAlmocoSaida: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Chegada almoço prevista</label>
                    <input type="time" value={formUsuario.usuarioHoraPrevistaAlmocoChegada || '13:00'} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioHoraPrevistaAlmocoChegada: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Foto</label>
                    <input ref={fileFotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setFormUsuario({ ...formUsuario, usuarioFotoBase64: (r.result as string)?.split(',')[1], usuarioFotoNome: f.name, usuarioFotoExtensao: f.name.split('.').pop() || '' }); r.readAsDataURL(f); } }} />
                    <Button type="button" variant="secondary" size="sm" onClick={() => fileFotoRef.current?.click()}>Carregar foto</Button>
                    {formUsuario.usuarioFotoBase64 && <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--gx2-success)' }}>✓ Foto carregada</span>}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>Projetos</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <Button type="button" variant="secondary" size="sm" onClick={() => { setModalProjetosAberta(true); setModalProjetoSelecionados([]); setModalProjetoTipo('P'); setModalProjetoValor(100); }}>+ Adicionar projetos</Button>
                      {usuarioProjetos.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          {usuarioProjetos.map((up) => (
                            <span key={up.projetoId} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--gx2-cinza-200)', borderRadius: 6, fontSize: 13 }}>
                              {up.projetoDescricao}
                              <span style={{ color: 'var(--gx2-turquesa)', fontWeight: 600 }}>{up.tipo === 'H' ? `${up.valor}h` : `${up.valor}%`}</span>
                              <button type="button" onClick={() => setUsuarioProjetos(usuarioProjetos.filter((x) => x.projetoId !== up.projetoId))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1, color: 'var(--gx2-texto-secundario)' }} title="Remover">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                      {usuarioProjetos.length === 0 && <span style={{ color: 'var(--gx2-cinza-500)', fontSize: 13 }}>Nenhum projeto selecionado</span>}
                    </div>
                  </div>
                  {modalProjetosAberta && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={(e) => e.target === e.currentTarget && setModalProjetosAberta(false)}>
                      <div style={{ background: 'var(--gx2-branco)', borderRadius: 8, padding: 24, maxWidth: 480, width: '90%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
                        <h4 style={{ marginBottom: 16 }}>Selecionar projetos</h4>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Tipo</label>
                          <select value={modalProjetoTipo} onChange={(e) => setModalProjetoTipo(e.target.value as 'H' | 'P')} style={{ ...inputStyle, width: '100%' }}>
                            <option value="P">Percentual</option>
                            <option value="H">Horas</option>
                          </select>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>{modalProjetoTipo === 'P' ? 'Percentual' : 'Horas'}</label>
                          {modalProjetoTipo === 'P' ? (
                            <select value={modalProjetoValor} onChange={(e) => setModalProjetoValor(Number(e.target.value))} style={{ ...inputStyle, width: '100%' }}>
                              <option value={25}>25%</option>
                              <option value={50}>50%</option>
                              <option value={75}>75%</option>
                              <option value={100}>100%</option>
                            </select>
                          ) : (
                            <input type="number" min={0} step={0.5} value={modalProjetoValor} onChange={(e) => setModalProjetoValor(Number(e.target.value) || 0)} style={{ ...inputStyle, width: '100%' }} placeholder="Ex: 20" />
                          )}
                        </div>
                        <div style={{ marginBottom: 16, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--gx2-cinza-200)', borderRadius: 6, padding: 8 }}>
                          {projetos.filter((p) => !usuarioProjetos.some((up) => up.projetoId === p.projetoId)).map((p) => (
                            <label key={p.projetoId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
                              <input type="checkbox" checked={modalProjetoSelecionados.includes(p.projetoId)} onChange={(e) => setModalProjetoSelecionados(e.target.checked ? [...modalProjetoSelecionados, p.projetoId] : modalProjetoSelecionados.filter((id) => id !== p.projetoId))} />
                              {p.projetoDescricao}
                            </label>
                          ))}
                          {projetos.filter((p) => !usuarioProjetos.some((up) => up.projetoId === p.projetoId)).length === 0 && <span style={{ color: 'var(--gx2-cinza-500)', fontSize: 13 }}>Todos os projetos já foram adicionados</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Button type="button" variant="cancel" size="sm" onClick={() => setModalProjetosAberta(false)}>Cancelar</Button>
                          <Button type="button" variant="success" size="sm" onClick={() => { const novos = modalProjetoSelecionados.map((pid) => ({ projetoId: pid, projetoDescricao: projetos.find((p) => p.projetoId === pid)?.projetoDescricao ?? '', tipo: modalProjetoTipo, valor: modalProjetoValor })); setUsuarioProjetos([...usuarioProjetos, ...novos]); setModalProjetosAberta(false); }}>Adicionar</Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formUsuario.usuarioAtivo !== false && formUsuario.usuarioAtivo !== 0} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioAtivo: e.target.checked })} />
                      Ativo
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formUsuario.usuarioAvisosAtivo === true} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioAvisosAtivo: e.target.checked })} />
                      Aviso
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formUsuario.usuarioObrigatorioComentario === true} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioObrigatorioComentario: e.target.checked })} />
                      Comentário obrigatório
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formUsuario.usuarioTravaApontamento === true} onChange={(e) => setFormUsuario({ ...formUsuario, usuarioTravaApontamento: e.target.checked })} />
                      Travar Apontamento
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button type="button" variant="success" size="sm" onClick={async () => {
                    setErroColaborador(null);
                    setCampoErroColaborador(null);
                    try {
                      const payload: Record<string, unknown> = {
                        usuarioLogin: formUsuario.usuarioLogin,
                        usuarioNome: formUsuario.usuarioNome,
                        usuarioEmail: formUsuario.usuarioEmail,
                        usuarioPerfil: formUsuario.usuarioPerfil ?? 4,
                        usuarioCargaHoraria: formUsuario.usuarioCargaHoraria ?? 44,
                        usuarioEmpresaId: formUsuario.usuarioEmpresaId ?? '',
                        equipeId: formUsuario.equipeId ?? '',
                        usuarioAtivo: formUsuario.usuarioAtivo ?? true,
                        usuarioEmailGestor: formUsuario.usuarioEmailGestor || null,
                        usuarioDataEntrada: formUsuario.usuarioDataEntrada || new Date().toISOString().split('T')[0],
                        usuarioDataSaida: formUsuario.usuarioDataSaida || null,
                        usuarioReferenciaData: formUsuario.usuarioReferenciaData || new Date().toISOString().split('T')[0],
                        usuarioAvisosAtivo: formUsuario.usuarioAvisosAtivo ?? false,
                        usuarioObrigatorioComentario: formUsuario.usuarioObrigatorioComentario ?? false,
                        usuarioTravaApontamento: formUsuario.usuarioTravaApontamento ?? false,
                        usuarioTotalHorasMensais: formUsuario.usuarioTotalHorasMensais ?? 176,
                        usuarioHoraPrevistaChegada: formUsuario.usuarioHoraPrevistaChegada || null,
                        usuarioHoraPrevistaSaida: formUsuario.usuarioHoraPrevistaSaida || null,
                        usuarioHoraPrevistaAlmocoSaida: formUsuario.usuarioHoraPrevistaAlmocoSaida || null,
                        usuarioHoraPrevistaAlmocoChegada: formUsuario.usuarioHoraPrevistaAlmocoChegada || null,
                        usuarioFotoBase64: formUsuario.usuarioFotoBase64 || null,
                        usuarioFotoNome: formUsuario.usuarioFotoNome || null,
                        usuarioFotoExtensao: formUsuario.usuarioFotoExtensao || null,
                      };
                      const hoje = new Date().toISOString().split('T')[0];
                      if (payload.usuarioDataSaida && String(payload.usuarioDataSaida).slice(0, 10) < hoje) payload.usuarioAtivo = false;
                      if (!formUsuario.usuarioId && !formUsuario.usuarioSenha) payload.usuarioSenha = '123456';
                      else if (formUsuario.usuarioId && formUsuario.usuarioSenha) payload.usuarioSenha = formUsuario.usuarioSenha;
                      let usuarioId: number;
                      if (formUsuario.usuarioId) {
                        await api.put(`/usuarios/${formUsuario.usuarioId}`, payload);
                        usuarioId = formUsuario.usuarioId;
                      } else {
                        const { data } = await api.post('/usuarios', payload);
                        usuarioId = data.usuarioId;
                      }
                      const projetosPayload = usuarioProjetos.map((up) => ({ projetoId: up.projetoId, tipo: up.tipo, valor: up.valor }));
                      await api.put(`/usuarios/${usuarioId}/projetos`, projetosPayload);
                      setEditandoUsuario(null);
                      carregar();
                    } catch (err: unknown) {
                      const res = (err as { response?: { data?: { error?: string } } })?.response;
                      const msg = res?.data?.error || 'Erro ao salvar. Verifique os dados e tente novamente.';
                      setErroColaborador(msg);
                      let campo: string | null = null;
                      if (/login/i.test(msg)) campo = 'usuarioLogin';
                      else if (/nome/i.test(msg)) campo = 'usuarioNome';
                      else if (/e-mail|email/i.test(msg)) campo = 'usuarioEmail';
                      setCampoErroColaborador(campo);
                      setTimeout(() => {
                        if (campo === 'usuarioLogin') refLogin.current?.focus();
                        else if (campo === 'usuarioNome') refNome.current?.focus();
                        else if (campo === 'usuarioEmail') refEmail.current?.focus();
                      }, 50);
                    }
                  }}>Salvar</Button>
                  <Button type="button" variant="cancel" size="sm" onClick={() => { setEditandoUsuario(null); setErroColaborador(null); setCampoErroColaborador(null); }}>Cancelar</Button>
                </div>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                  <th style={thBase}>Login</th>
                  <th style={thBase}>Nome</th>
                  <th style={thBase}>E-mail</th>
                  <th style={thBase}>Perfil</th>
                  <th style={thBase}>Empresa</th>
                  <th style={thBase}>Carga (h)</th>
                  <th style={thBase}>Situação</th>
                  <th style={{ ...thBase, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.usuarioId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                    <td style={{ padding: 12 }}>{u.usuarioLogin}</td>
                    <td style={{ padding: 12 }}>{u.usuarioNome}</td>
                    <td style={{ padding: 12 }}>{u.usuarioEmail || '-'}</td>
                    <td style={{ padding: 12 }}>{PERFIL[u.usuarioPerfil] || u.usuarioPerfil}</td>
                    <td style={{ padding: 12 }}>{u.Empresa?.empresaDescricao || '-'}</td>
                    <td style={{ padding: 12 }}>{u.usuarioCargaHoraria ?? '-'}</td>
                    <td style={{ padding: 12 }}>{u.usuarioAtivo ? 'Ativo' : 'Inativo'}</td>
                    <td style={acoesCellStyle}>
                      <button type="button" onClick={async () => { setEditandoUsuario(u); setFormUsuario({ ...u, usuarioSenha: '' }); setUsuarioProjetos([]); setErroColaborador(null); setCampoErroColaborador(null); try { const { data } = await api.get(`/usuarios/${u.usuarioId}/projetos`); setUsuarioProjetos((data || []).map((x: { projetoId: number; Projeto?: { projetoDescricao: string }; tipo: string; valor: number }) => ({ projetoId: x.projetoId, projetoDescricao: x.Projeto?.projetoDescricao ?? '', tipo: (x.tipo || 'P') as 'H' | 'P', valor: Number(x.valor) ?? 100 }))); } catch (_) { setUsuarioProjetos([]); } }} style={btnEditIcon} title="Editar">✎</button>
                      <button type="button" onClick={() => { if (confirm('Excluir este usuário?')) api.delete(`/usuarios/${u.usuarioId}`).then(carregar); }} style={btnDeleteIcon} title="Excluir">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuarios.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)' }}>Nenhum usuário</p>}
          </div>
        )}
        {submenu === 'data-referencia' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: 16 }}>Alterar Data de Referência</h3>
            <p style={{ marginBottom: 20, color: 'var(--gx2-texto-secundario)', fontSize: 14 }}>A data de referência define o período de apuração das horas. Altere para um usuário específico ou para todos.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Nova data de referência</label>
                <input type="date" value={dataRefData} onChange={(e) => setDataRefData(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Usuário (vazio = todos)</label>
                <select value={dataRefUsuario} onChange={(e) => setDataRefUsuario(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
                  <option value="">Todos os usuários</option>
                  {usuarios.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome} ({u.usuarioLogin})</option>)}
                </select>
              </div>
              <Button type="button" variant="success" size="sm" onClick={async () => {
                try {
                  if (!dataRefData) { alert('Informe a data de referência.'); return; }
                  const r = await api.post('/cadastro/data-referencia', { dataReferencia: dataRefData, usuarioId: dataRefUsuario || undefined });
                  setDataRefResultado(`${r.data.atualizados ?? 0} registro(s) atualizado(s).`);
                  carregar();
                } catch (err: unknown) {
                  alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao aplicar.');
                }
              }}>Aplicar</Button>
            </div>
            {dataRefResultado && <p style={{ padding: 12, background: 'var(--gx2-success-bg)', color: 'var(--gx2-success)', borderRadius: 6, marginBottom: 20 }}>{dataRefResultado}</p>}
            <div>
              <h4 style={{ marginBottom: 12, fontSize: 14, color: 'var(--gx2-texto-secundario)' }}>Data de referência atual por colaborador</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                    <th style={{ ...thBase, padding: 10, textAlign: 'left' }}>Colaborador</th>
                    <th style={{ ...thBase, padding: 10, textAlign: 'left' }}>Login</th>
                    <th style={{ ...thBase, padding: 10, textAlign: 'left' }}>Data de referência</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.usuarioId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                      <td style={{ padding: 10 }}>{u.usuarioNome}</td>
                      <td style={{ padding: 10 }}>{u.usuarioLogin}</td>
                      <td style={{ padding: 10 }}>{u.usuarioReferenciaData ? new Date(u.usuarioReferenciaData).toLocaleDateString('pt-BR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuarios.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)' }}>Nenhum colaborador cadastrado</p>}
            </div>
          </div>
        )}
        {submenu === 'exportar-importar' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: 16 }}>Exportar ou Importar Usuários e Gestor</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24, alignItems: 'center' }}>
              <Button variant="success" size="sm" onClick={async () => {
                try {
                  const r = await api.get('/cadastro/exportar-usuarios', { responseType: 'blob' });
                  const url = URL.createObjectURL(r.data);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'usuarios_gestores_export.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  alert('Erro ao exportar.');
                }
              }}>Exportar CSV</Button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <input ref={fileImportRef} type="file" accept=".xlsx,.xls,.csv" multiple style={{ display: 'none' }} onChange={(e) => { const files = e.target.files ? Array.from(e.target.files) : []; setImportArquivos((prev) => [...prev, ...files]); e.target.value = ''; }} />
                <Button type="button" variant="success" size="sm" onClick={() => fileImportRef.current?.click()}>Importar arquivos</Button>
                <Button type="button" variant="success" size="sm" onClick={async () => {
                  if (importArquivos.length === 0) { alert('Selecione ao menos um arquivo.'); return; }
                  setImportLoading(true);
                  setImportPreview([]);
                  try {
                    const todas: { nome: string; email: string; emailGestor: string }[] = [];
                    for (const file of importArquivos) {
                      const linhas = await (async () => {
                        if (file.name.toLowerCase().endsWith('.csv')) {
                          const txt = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(file, 'UTF-8'); });
                          const linhas = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                          const sep = linhas[0]?.includes(';') ? ';' : ',';
                          const cols = linhas[0]?.split(sep).map((c) => c.trim()) ?? [];
                          const idxNome = (() => { const i = cols.findIndex((c) => /nome|name/i.test(c)); return i >= 0 ? i : 0; })();
                          const idxEmail = (() => { const i = cols.findIndex((c) => /e-?mail|email/i.test(c)); return i >= 0 ? i : 1; })();
                          const idxGestor = cols.findIndex((c) => /gestor/i.test(c));
                          return linhas.slice(1).map((l) => { const p = l.split(sep); return { nome: (p[idxNome] ?? '').trim(), email: (p[idxEmail] ?? '').trim(), emailGestor: (idxGestor >= 0 ? p[idxGestor] : '')?.trim() ?? '' }; });
                        }
                        const buf = await new Promise<ArrayBuffer>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as ArrayBuffer); r.onerror = rej; r.readAsArrayBuffer(file); });
                        const wb = XLSX.read(buf, { type: 'array' });
                        const sh = wb.Sheets[wb.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json<string[]>(sh, { header: 1, defval: '' }) as string[][];
                        if (rows.length < 2) return [];
                        const h = rows[0].map((c) => String(c ?? ''));
                        const iN = (() => { const i = h.findIndex((c) => /nome|name/i.test(c)); return i >= 0 ? i : 0; })();
                        const iE = (() => { const i = h.findIndex((c) => /e-?mail|email/i.test(c)); return i >= 0 ? i : 1; })();
                        const iG = h.findIndex((c) => /gestor/i.test(c));
                        return rows.slice(1).map((r) => ({ nome: String(r[iN] ?? '').trim(), email: String(r[iE] ?? '').trim(), emailGestor: (iG >= 0 ? String(r[iG] ?? '') : '').trim() }));
                      })();
                      todas.push(...linhas.filter((x) => x.nome || x.email));
                    }
                    setImportPreview(todas);
                  } catch (err) {
                    alert('Erro ao ler arquivo(s). Verifique o formato (CSV ou Excel com colunas Nome, E-mail, E-mail Gestor).');
                    console.error(err);
                  } finally {
                    setImportLoading(false);
                  }
                }} disabled={importLoading || importArquivos.length === 0}>Iniciar</Button>
                <Button type="button" variant="cancel" size="sm" onClick={() => { setImportArquivos([]); setImportPreview([]); setImportResult(null); }}>Cancelar upload</Button>
                <Button type="button" variant="success" size="sm" onClick={async () => {
                  if (importPreview.length === 0) { alert('Nenhum dado para importar. Use Iniciar após selecionar arquivos.'); return; }
                  setImportLoading(true);
                  try {
                    const r = await api.post('/cadastro/importar-usuarios', { linhas: importPreview });
                    setImportResult(r.data);
                    setImportPreview([]);
                    setImportArquivos([]);
                    carregar();
                  } catch (err: unknown) {
                    alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao importar.');
                  } finally {
                    setImportLoading(false);
                  }
                }} disabled={importLoading || importPreview.length === 0}>Confirmar importação</Button>
                {importArquivos.length > 0 && <span style={{ fontSize: 13, color: 'var(--gx2-texto-secundario)' }}>{importArquivos.length} arquivo(s) selecionado(s)</span>}
              </div>
            </div>
            {importResult && (
              <div style={{ marginBottom: 16, padding: 12, background: 'var(--gx2-success-bg)', color: 'var(--gx2-success)', borderRadius: 6 }}>
                <strong>Importação concluída:</strong> {importResult.criados} criados, {importResult.atualizados} atualizados de {importResult.total} linhas.
                {importResult.erros?.length ? <ul style={{ margin: '8px 0 0 20px', fontSize: 13 }}>{importResult.erros.map((e, i) => <li key={i}>{e}</li>)}</ul> : null}
              </div>
            )}
            <div>
              <h4 style={{ marginBottom: 12, fontSize: 14, color: 'var(--gx2-texto-secundario)' }}>Pré-visualização</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                    <th style={{ ...thBase, padding: 10, textAlign: 'left' }}>Nome</th>
                    <th style={{ ...thBase, padding: 10, textAlign: 'left' }}>E-mail</th>
                    <th style={{ ...thBase, padding: 10, textAlign: 'left' }}>E-mail do gestor</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                      <td style={{ padding: 10 }}>{row.nome}</td>
                      <td style={{ padding: 10 }}>{row.email}</td>
                      <td style={{ padding: 10 }}>{row.emailGestor || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importPreview.length === 0 && !importLoading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)', fontSize: 13 }}>Selecione arquivos e clique em Iniciar para visualizar os dados.</p>}
            </div>
          </div>
        )}
        {submenu === 'valor-hora' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3>Valor hora do usuário</h3>
              <Button type="button" variant="success" size="sm" onClick={() => { setEditandoValorHora({}); setFormValorHora({ usuarioId: '', valorHoraData: new Date().toISOString().split('T')[0], valorHoraValor: '' }); }}>+ Novo</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Nome</label>
                <input type="text" value={filtroValorHoraColaborador} onChange={(e) => setFiltroValorHoraColaborador(e.target.value)} placeholder="Filtrar por nome" style={{ ...inputStyle, minWidth: 180 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Valor de</label>
                <input type="number" step="0.01" value={filtroValorHoraDe} onChange={(e) => setFiltroValorHoraDe(e.target.value)} placeholder="Ex: 0" style={{ ...inputStyle, minWidth: 100 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Valor até</label>
                <input type="number" step="0.01" value={filtroValorHoraAte} onChange={(e) => setFiltroValorHoraAte(e.target.value)} placeholder="Ex: 150" style={{ ...inputStyle, minWidth: 100 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--gx2-texto-secundario)' }}>Data</label>
                <input type="date" value={filtroValorHoraData} onChange={(e) => setFiltroValorHoraData(e.target.value)} style={inputStyle} />
              </div>
              <Button type="button" variant="success" size="sm" onClick={carregarValorHora}>Filtrar</Button>
            </div>
            {editandoValorHora && (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--gx2-cinza-100)', borderRadius: 6 }}>
                <h4 style={{ marginBottom: 12, fontSize: 14 }}>{editandoValorHora.usuarioValorHoraId ? 'Editar' : 'Novo registro'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, maxWidth: 500 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Colaborador</label>
                    <select value={formValorHora.usuarioId} onChange={(e) => setFormValorHora({ ...formValorHora, usuarioId: e.target.value })} disabled={!!editandoValorHora.usuarioValorHoraId} style={{ ...inputStyle, width: '100%' }}>
                      <option value="">— Selecione —</option>
                      {usuarios.map((u) => <option key={u.usuarioId} value={u.usuarioId}>{u.usuarioNome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Data</label>
                    <input type="date" value={formValorHora.valorHoraData} onChange={(e) => setFormValorHora({ ...formValorHora, valorHoraData: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Valor (R$)</label>
                    <input type="number" step="0.01" value={formValorHora.valorHoraValor} onChange={(e) => setFormValorHora({ ...formValorHora, valorHoraValor: e.target.value })} placeholder="0,00" style={{ ...inputStyle, width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button type="button" variant="success" size="sm" onClick={async () => {
                    try {
                      if (!formValorHora.usuarioId || !formValorHora.valorHoraData) { alert('Preencha colaborador e data.'); return; }
                      if (editandoValorHora.usuarioValorHoraId) {
                        await api.put(`/cadastro/valor-hora/${editandoValorHora.usuarioValorHoraId}`, { data: formValorHora.valorHoraData, valor: formValorHora.valorHoraValor || 0 });
                      } else {
                        await api.post('/cadastro/valor-hora', { usuarioId: formValorHora.usuarioId, data: formValorHora.valorHoraData, valor: formValorHora.valorHoraValor || 0 });
                      }
                      setEditandoValorHora(null);
                      carregarValorHora();
                    } catch (err: unknown) {
                      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao salvar.');
                    }
                  }}>Salvar</Button>
                  <Button type="button" variant="cancel" size="sm" onClick={() => setEditandoValorHora(null)}>Cancelar</Button>
                </div>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gx2-cinza-200)' }}>
                  <th style={{ ...thBase, textAlign: 'left' }}>Nome</th>
                  <th style={{ ...thBase, textAlign: 'left' }}>Data</th>
                  <th style={{ ...thBase, textAlign: 'right' }}>Valor</th>
                  <th style={{ ...thBase, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {valorHoraList.map((v) => (
                  <tr key={v.usuarioValorHoraId} style={{ borderBottom: '1px solid var(--gx2-cinza-100)' }}>
                    <td style={{ padding: 12 }}>{v.usuarioNome}</td>
                    <td style={{ padding: 12 }}>{v.valorHoraData ? new Date(v.valorHoraData).toLocaleDateString('pt-BR') : '-'}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>R$ {Number(v.valorHoraValor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={acoesCellStyle}>
                      <button type="button" onClick={() => { setEditandoValorHora(v); setFormValorHora({ usuarioId: String(v.usuarioId), valorHoraData: v.valorHoraData ? String(v.valorHoraData).slice(0, 10) : new Date().toISOString().split('T')[0], valorHoraValor: String(v.valorHoraValor ?? '') }); }} style={btnEditIcon} title="Editar">✎</button>
                      <button type="button" onClick={() => { if (confirm('Excluir?')) api.delete(`/cadastro/valor-hora/${v.usuarioValorHoraId}`).then(carregarValorHora); }} style={btnDeleteIcon} title="Excluir">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {valorHoraList.length === 0 && !loading && <p style={{ padding: 24, color: 'var(--gx2-cinza-500)', fontSize: 13 }}>Nenhum registro. Use os filtros ou clique em + Novo.</p>}
          </div>
        )}
        {submenu === 'periodo-fechamento' && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: 16 }}>Período de Fechamento de Horas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Mês inicial</label>
                <select value={periodoFechamento.PERIODO_FECHAMENTO_MES_INICIAL ?? String(new Date().getMonth() + 1)} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, PERIODO_FECHAMENTO_MES_INICIAL: e.target.value })} style={inputStyle}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => <option key={m} value={m}>{m} - {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][m-1]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Mês final</label>
                <select value={periodoFechamento.PERIODO_FECHAMENTO_MES_FINAL ?? '12'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, PERIODO_FECHAMENTO_MES_FINAL: e.target.value })} style={inputStyle}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => <option key={m} value={m}>{m} - {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][m-1]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Ano</label>
                <input type="number" value={periodoFechamento.PERIODO_FECHAMENTO_ANO || String(new Date().getFullYear())} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, PERIODO_FECHAMENTO_ANO: e.target.value })} min={2020} max={2030} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 24, padding: 16, background: 'var(--gx2-success-bg)', borderRadius: 8, borderLeft: '4px solid var(--gx2-success)' }}>
              <h4 style={{ marginBottom: 12, color: 'var(--gx2-azul-marinho)', fontSize: 15 }}>Verde</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={periodoFechamento.VERDE_GESTOR_EMAIL === '1'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, VERDE_GESTOR_EMAIL: e.target.checked ? '1' : '0' })} />
                Quando Verde Gestor recebe Email?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={periodoFechamento.VERDE_COLABORADOR_EMAIL === '1'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, VERDE_COLABORADOR_EMAIL: e.target.checked ? '1' : '0' })} />
                Quando Verde Colaborador recebe Email?
              </label>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Outros recebem email</label>
                <textarea value={periodoFechamento.VERDE_OUTROS_EMAIL ?? ''} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, VERDE_OUTROS_EMAIL: e.target.value })} rows={3} style={{ ...inputStyle, width: '100%', minHeight: 80 }} placeholder="E-mails adicionais (um por linha)" />
              </div>
            </div>
            <div style={{ marginBottom: 24, padding: 16, background: 'var(--gx2-warning-bg)', borderRadius: 8, borderLeft: '4px solid var(--gx2-warning)' }}>
              <h4 style={{ marginBottom: 12, color: 'var(--gx2-azul-marinho)', fontSize: 15 }}>Amarelo</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Quantidade de horas amarela a partir de (pra mais ou menos)</label>
                <input type="number" value={periodoFechamento.AMARELO_HORAS ?? '0'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, AMARELO_HORAS: e.target.value })} step={0.5} min={0} style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={periodoFechamento.AMARELO_GESTOR_EMAIL === '1'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, AMARELO_GESTOR_EMAIL: e.target.checked ? '1' : '0' })} />
                Quando Amarela Gestor recebe Email?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={periodoFechamento.AMARELO_COLABORADOR_EMAIL === '1'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, AMARELO_COLABORADOR_EMAIL: e.target.checked ? '1' : '0' })} />
                Quando Amarela Colaborador recebe Email?
              </label>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Outros recebem email</label>
                <textarea value={periodoFechamento.AMARELO_OUTROS_EMAIL ?? ''} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, AMARELO_OUTROS_EMAIL: e.target.value })} rows={3} style={{ ...inputStyle, width: '100%', minHeight: 80 }} placeholder="E-mails adicionais (um por linha)" />
              </div>
            </div>
            <div style={{ marginBottom: 24, padding: 16, background: 'var(--gx2-danger-bg)', borderRadius: 8, borderLeft: '4px solid var(--gx2-danger)' }}>
              <h4 style={{ marginBottom: 12, color: 'var(--gx2-danger)', fontSize: 15 }}>Vermelho</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Quantidade de horas vermelha a partir de (pra mais ou menos)</label>
                <input type="number" value={periodoFechamento.VERMELHO_HORAS ?? '0'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, VERMELHO_HORAS: e.target.value })} step={0.5} min={0} style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={periodoFechamento.VERMELHO_GESTOR_EMAIL === '1'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, VERMELHO_GESTOR_EMAIL: e.target.checked ? '1' : '0' })} />
                Quando Vermelha Gestor recebe Email?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={periodoFechamento.VERMELHO_COLABORADOR_EMAIL === '1'} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, VERMELHO_COLABORADOR_EMAIL: e.target.checked ? '1' : '0' })} />
                Quando Vermelha Colaborador recebe Email?
              </label>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Outros que recebem email</label>
                <textarea value={periodoFechamento.VERMELHO_OUTROS_EMAIL ?? ''} onChange={(e) => setPeriodoFechamento({ ...periodoFechamento, VERMELHO_OUTROS_EMAIL: e.target.value })} rows={3} style={{ ...inputStyle, width: '100%', minHeight: 80 }} placeholder="E-mails adicionais (um por linha)" />
              </div>
            </div>
            <Button type="button" variant="success" size="sm" onClick={async () => {
              try {
                await api.post('/cadastro/periodo-fechamento', {
                  mesInicial: periodoFechamento.PERIODO_FECHAMENTO_MES_INICIAL || '1',
                  mesFinal: periodoFechamento.PERIODO_FECHAMENTO_MES_FINAL || '12',
                  ano: periodoFechamento.PERIODO_FECHAMENTO_ANO || String(new Date().getFullYear()),
                  verdeGestorEmail: periodoFechamento.VERDE_GESTOR_EMAIL === '1',
                  verdeColaboradorEmail: periodoFechamento.VERDE_COLABORADOR_EMAIL === '1',
                  verdeOutrosEmail: periodoFechamento.VERDE_OUTROS_EMAIL ?? '',
                  amareloHoras: periodoFechamento.AMARELO_HORAS ?? '0',
                  amareloGestorEmail: periodoFechamento.AMARELO_GESTOR_EMAIL === '1',
                  amareloColaboradorEmail: periodoFechamento.AMARELO_COLABORADOR_EMAIL === '1',
                  amareloOutrosEmail: periodoFechamento.AMARELO_OUTROS_EMAIL ?? '',
                  vermelhoHoras: periodoFechamento.VERMELHO_HORAS ?? '0',
                  vermelhoGestorEmail: periodoFechamento.VERMELHO_GESTOR_EMAIL === '1',
                  vermelhoColaboradorEmail: periodoFechamento.VERMELHO_COLABORADOR_EMAIL === '1',
                  vermelhoOutrosEmail: periodoFechamento.VERMELHO_OUTROS_EMAIL ?? '',
                });
                alert('Salvo.');
              } catch (err: unknown) {
                alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao salvar.');
              }
            }}>Salvar</Button>
          </div>
        )}
    </div>
  );
}
