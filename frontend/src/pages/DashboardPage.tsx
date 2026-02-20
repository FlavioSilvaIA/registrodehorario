/**
 * DashboardPage - Equivalente a SdDashBoard
 * Origem: sddashboard.properties.json
 * Exibe: apontamento em aberto, projetos, horas do dia
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/ui/Card';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { formatarHorasDecimalParaHHMM } from '../utils/formatarHoras';

interface ApontamentoAberto {
  apontamentoId: number;
  apontamentoInicioDataHora: string;
  Projeto?: { projetoDescricao: string };
}

interface Projeto {
  projetoId: number;
  projetoDescricao: string;
}

export default function DashboardPage() {
  useAuth();
  const [apontamento, setApontamento] = useState<ApontamentoAberto | null>(null);
  const [horasDia, setHorasDia] = useState<string>('0');
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/apontamentos/aberto'),
      api.get('/apontamentos/horas-dia'),
      api.get('/projetos'),
    ]).then(([r1, r2, r3]) => {
      setApontamento(r1.data.apontamento);
      setHorasDia(r2.data.horasTotal || '0');
      setProjetos(r3.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20 }}><SkeletonCard /><div style={{ marginTop: 16 }}><SkeletonCard /></div></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20 }}>Dashboard</h2>

      <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        <Card>
          <h3 style={{ marginBottom: 8 }}>Horas hoje</h3>
          <p style={{ fontSize: 24, fontWeight: 600 }}>{formatarHorasDecimalParaHHMM(horasDia)}</p>
        </Card>
        <Card>
          <h3 style={{ marginBottom: 8 }}>Apontamento em aberto</h3>
          {apontamento ? (
            <p>
              Entrada: {new Date(apontamento.apontamentoInicioDataHora).toLocaleTimeString('pt-BR')}
              {apontamento.Projeto?.projetoDescricao && ` — ${apontamento.Projeto.projetoDescricao}`}
              <br />
              <Link to="/apontamento" style={{ color: 'var(--gx2-turquesa)', marginTop: 8, display: 'inline-block' }}>Registrar saída →</Link>
            </p>
          ) : (
            <p>
              Nenhum apontamento em aberto.
              <Link to="/apontamento" style={{ color: 'var(--gx2-turquesa)', marginLeft: 8 }}>Registrar entrada →</Link>
            </p>
          )}
        </Card>
      </div>

      <Card>
        <h3 style={{ marginBottom: 12 }}>Projetos</h3>
        {projetos.length === 0 ? (
          <EmptyState title="Nenhum projeto" description="Não há projetos cadastrados." />
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {projetos.map((p) => (
              <li key={p.projetoId} style={{ padding: '8px 0', borderBottom: '1px solid var(--gx2-cinza-200)' }}>{p.projetoDescricao}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
