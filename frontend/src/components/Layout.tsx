/**
 * Layout - Sidebar e topbar GX2
 * GX2-FIX: cores, ícones Lucide, avatar
 */
import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Home,
  List,
  Clock,
  FolderOpen,
  DollarSign,
  Bell,
  Settings,
  FileText,
  ChevronRight,
  Mail,
  LogOut,
} from 'lucide-react';
import Button from './ui/Button';
import LogoGX2 from './ui/LogoGX2';

const cadastroSubmenu = [
  { tab: 'centro-custo', label: 'Centro de Custo' },
  { tab: 'empresa', label: 'Empresa' },
  { tab: 'equipe', label: 'Equipe' },
  { tab: 'evento', label: 'Evento' },
  { tab: 'log', label: 'Log' },
  { tab: 'projeto', label: 'Projeto' },
  { tab: 'usuario', label: 'Usuário' },
  { tab: 'data-referencia', label: 'Alterar Data de Referência' },
  { tab: 'exportar-importar', label: 'Exportar ou Importar Usuários e Gestor' },
  { tab: 'valor-hora', label: 'Valor hora do usuário' },
  { tab: 'periodo-fechamento', label: 'Período de Fechamento de Horas' },
];

const reembolsoSubmenu = [
  { tab: 'reembolsos', label: 'Reembolsos' },
  { tab: 'tipo-reembolso', label: 'Tipo de Reembolso', path: '/tipo-reembolso' },
];

const notificacaoSubmenu = [
  { tab: 'cadastro', label: 'Cadastro' },
];

const relatorioSubmenu = [
  { path: '/relatorio/colaborador', label: 'Colaborador' },
  { path: '/relatorio/horarios-consolidados', label: 'Horários Consolidados' },
  { path: '/relatorio/fechamento-reembolso', label: 'Fechamento de Reembolso' },
  { path: '/relatorio/previa', label: 'Prévia' },
  { path: '/relatorio/projeto', label: 'Projeto' },
  { path: '/relatorio/projeto-centro-custo', label: 'Projeto/Centro de Custo' },
];

const PERFIL_LABEL: Record<number, string> = {
  1: 'Admin GX2', 2: 'Admin Empresa', 3: 'Coordenador', 4: 'Colaborador', 5: 'Gestão Projetos',
};

const menuItems = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/lista-apontamento', label: 'Lista de Apontamento', Icon: List },
  { path: '/apontamento', label: 'Registrar', Icon: Clock },
  { path: '/cadastro', label: 'Cadastro', Icon: FolderOpen, submenu: cadastroSubmenu },
  { path: '/reembolso', label: 'Reembolso', Icon: DollarSign, submenu: reembolsoSubmenu },
  { path: '/notificacao', label: 'Notificação', Icon: Bell, submenu: notificacaoSubmenu },
  { path: '/parametros', label: 'Parâmetros', Icon: Settings },
  { path: '/relatorio', label: 'Relatório', Icon: FileText, submenu: relatorioSubmenu },
];

export default function Layout() {
  const { usuario, logout, refreshUsuario } = useAuth();
  const fileFotoRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const isCadastroPath = location.pathname === '/cadastro';
  const isReembolsoPath = location.pathname === '/reembolso' || location.pathname === '/tipo-reembolso';
  const isNotificacaoPath = location.pathname === '/notificacao';
  const isRelatorioPath = location.pathname.startsWith('/relatorio');
  const [cadastroAberto, setCadastroAberto] = useState(isCadastroPath);
  const [reembolsoAberto, setReembolsoAberto] = useState(isReembolsoPath);
  const [notificacaoAberto, setNotificacaoAberto] = useState(isNotificacaoPath);
  const [relatorioAberto, setRelatorioAberto] = useState(isRelatorioPath);
  const tabAtual = new URLSearchParams(location.search).get('tab') || '';
  useEffect(() => {
    if (isCadastroPath) setCadastroAberto(true);
  }, [isCadastroPath]);
  useEffect(() => {
    if (isReembolsoPath) setReembolsoAberto(true);
  }, [isReembolsoPath]);
  useEffect(() => {
    if (isNotificacaoPath) setNotificacaoAberto(true);
  }, [isNotificacaoPath]);
  useEffect(() => {
    if (isRelatorioPath) setRelatorioAberto(true);
  }, [isRelatorioPath]);

  const activeColor = 'var(--gx2-turquesa-claro)';
  const activeBg = 'rgba(25, 219, 209, 0.15)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gx2-cinza-100)' }}>
      {/* Sidebar - GX2 azul marinho */}
      <aside style={{
        width: 240,
        background: 'var(--gx2-azul-marinho)',
        color: 'var(--gx2-branco)',
        padding: 'var(--spacing-5) 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 var(--spacing-5) var(--spacing-5)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <input ref={fileFotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && usuario?.usuarioId) {
              const r = new FileReader();
              r.onload = () => {
                const base64 = (r.result as string)?.split(',')[1];
                const ext = f.name.split('.').pop() || 'jpeg';
                api.put(`/usuarios/${usuario.usuarioId}`, { usuarioFotoBase64: base64, usuarioFotoNome: f.name, usuarioFotoExtensao: ext })
                  .then(() => refreshUsuario())
                  .catch(() => alert('Erro ao enviar foto.'));
              };
              r.readAsDataURL(f);
            }
            e.target.value = '';
          }} />
          <div role="button" tabIndex={0} aria-label="Alterar foto" onClick={() => fileFotoRef.current?.click()} onKeyDown={(e) => e.key === 'Enter' && fileFotoRef.current?.click()} style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gx2-turquesa)', margin: '0 auto var(--spacing-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden', cursor: 'pointer', position: 'relative' }} title="Clique para alterar foto">
            {usuario?.usuarioFotoBase64 ? (
              <img src={`data:image/${usuario?.usuarioFotoExtensao || 'jpeg'};base64,${usuario.usuarioFotoBase64}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              usuario?.usuarioNome?.charAt(0) || 'U'
            )}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{usuario?.usuarioNome}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{PERFIL_LABEL[usuario?.usuarioPerfil ?? 4] || 'Colaborador'}</div>
        </div>
        <nav style={{ marginTop: 'var(--spacing-5)' }}>
          {menuItems.map((item) => {
            const isCadastro = item.path === '/cadastro';
            const isReembolso = item.path === '/reembolso';
            const isNotificacao = item.path === '/notificacao';
            const isRelatorio = item.path === '/relatorio';
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) || (item.path === '/reembolso' && location.pathname === '/tipo-reembolso');
            const hasSubmenu = (item as { submenu?: unknown[] }).submenu;
            const aberto = isCadastro ? cadastroAberto : isReembolso ? reembolsoAberto : isNotificacao ? notificacaoAberto : isRelatorio ? relatorioAberto : false;
            const setAberto = isCadastro ? setCadastroAberto : isReembolso ? setReembolsoAberto : isNotificacao ? setNotificacaoAberto : isRelatorio ? setRelatorioAberto : () => {};
            const Icon = (item as { Icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }).Icon;

            if (hasSubmenu && (isCadastro || isReembolso || isNotificacao || isRelatorio)) {
              return (
                <div key={item.path}>
                  <div
                    onClick={() => setAberto(!aberto)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 'var(--spacing-3) var(--spacing-5)',
                      color: isActive ? activeColor : 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      background: isActive ? activeBg : 'transparent',
                      borderLeft: isActive ? `3px solid ${activeColor}` : '3px solid transparent',
                    }}
                  >
                    {Icon && <Icon size={18} style={{ marginRight: 10, flexShrink: 0 }} />}
                    {item.label}
                    <ChevronRight size={16} style={{ marginLeft: 'auto', transform: aberto ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  {aberto && (item as { submenu: { tab?: string; label: string; path?: string }[] }).submenu.map((sub) => {
                    const subPath = isCadastro ? '/cadastro' : isReembolso ? '/reembolso' : isNotificacao ? '/notificacao' : '/relatorio';
                    const subLink = (sub as { path?: string }).path ?? `${subPath}?tab=${(sub as { tab?: string }).tab}`;
                    const subActive = (sub as { path?: string }).path ? location.pathname === (sub as { path?: string }).path : tabAtual === (sub as { tab?: string }).tab;
                    return (
                      <Link
                        key={(sub as { path?: string }).path ?? (sub as { tab?: string }).tab}
                        to={subLink}
                        style={{
                          display: 'block',
                          padding: '10px var(--spacing-5) 10px 48px',
                          color: subActive ? activeColor : 'rgba(255,255,255,0.85)',
                          textDecoration: 'none',
                          fontSize: 14,
                          background: subActive ? activeBg : 'transparent',
                          borderLeft: subActive ? `3px solid ${activeColor}` : '3px solid transparent',
                        }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-3) var(--spacing-5)',
                  color: isActive ? activeColor : 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  background: isActive ? activeBg : 'transparent',
                  borderLeft: isActive ? `3px solid ${activeColor}` : '3px solid transparent',
                }}
              >
                {Icon && <Icon size={18} style={{ marginRight: 10, flexShrink: 0 }} />}
                {item.label}
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </Link>
            );
          })}
        </nav>
        {/* Logo GX2 abaixo do menu */}
        <div style={{ padding: 'var(--spacing-5)', marginTop: 'auto', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <LogoGX2 variant="light" height={32} />
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar - GX2 */}
        <header style={{
          height: 56,
          background: 'var(--gx2-branco)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--spacing-6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <LogoGX2 variant="dark" height={28} />
            <span style={{ color: 'var(--gx2-texto-secundario)', fontSize: 14 }}>REGISTRO DE HORAS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <Mail size={18} style={{ color: 'var(--gx2-texto-secundario)' }} aria-label="E-mail" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <div role="button" tabIndex={0} aria-label="Alterar foto" onClick={() => fileFotoRef.current?.click()} onKeyDown={(e) => e.key === 'Enter' && fileFotoRef.current?.click()} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gx2-turquesa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gx2-branco)', fontSize: 12, overflow: 'hidden', cursor: 'pointer' }} title="Clique para alterar foto">
                {usuario?.usuarioFotoBase64 ? (
                  <img src={`data:image/${usuario?.usuarioFotoExtensao || 'jpeg'};base64,${usuario.usuarioFotoBase64}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  usuario?.usuarioNome?.charAt(0) || 'U'
                )}
              </div>
              <span style={{ fontSize: 14 }}>{usuario?.usuarioNome}</span>
              <Button variant="ghost" size="sm" onClick={logout} iconLeft={<LogOut size={14} />}>Sair</Button>
            </div>
            <span style={{ color: 'var(--gx2-texto-secundario)', fontSize: 13 }}>Trabalho</span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 'var(--spacing-6)', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
