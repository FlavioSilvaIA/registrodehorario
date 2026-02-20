/**
 * App - Rotas principais
 * Equivalente a fluxo SdLogin -> SdDashBoard -> SdApontamento -> Lista de Apontamento
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { SkeletonCard } from './components/ui/Skeleton';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ApontamentoPage from './pages/ApontamentoPage';
import ListaApontamentoPage from './pages/ListaApontamentoPage';
import CadastroPage from './pages/CadastroPage';
import ReembolsoPage from './pages/ReembolsoPage';
import TipoReembolsoPage from './pages/TipoReembolsoPage';
import NotificacaoPage from './pages/NotificacaoPage';
import ParametrosPage from './pages/ParametrosPage';
import RelatorioPage from './pages/RelatorioPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ padding: 20 }}><SkeletonCard /></div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="apontamento" element={<ApontamentoPage />} />
        <Route path="lista-apontamento" element={<ListaApontamentoPage />} />
        <Route path="cadastro" element={<CadastroPage />} />
        <Route path="reembolso" element={<ReembolsoPage />} />
        <Route path="tipo-reembolso" element={<TipoReembolsoPage />} />
        <Route path="notificacao" element={<NotificacaoPage />} />
        <Route path="parametros" element={<ParametrosPage />} />
        <Route path="relatorio" element={<RelatorioPage />} />
        <Route path="relatorio/:tipo" element={<RelatorioPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
