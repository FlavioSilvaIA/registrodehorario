/**
 * LoginPage - Equivalente a SdLogin
 * GX2 Design System aplicado
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FormInput } from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function LoginPage() {
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [usuarioSenha, setUsuarioSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();

  if (token) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(usuarioLogin, usuarioSenha);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao fazer login';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 'var(--spacing-6)' }}>
      <Card>
        <h1 style={{ marginBottom: 'var(--spacing-6)', textAlign: 'center', fontSize: 20, fontWeight: 700 }}>Registro Horário</h1>
        <form onSubmit={handleSubmit}>
          <FormInput
            id="login"
            label="Login"
            type="text"
            value={usuarioLogin}
            onChange={(e) => setUsuarioLogin(e.target.value)}
            required
          />
          <FormInput
            id="senha"
            label="Senha"
            type="password"
            value={usuarioSenha}
            onChange={(e) => setUsuarioSenha(e.target.value)}
            required
          />
          {erro && <p style={{ color: 'var(--gx2-danger)', marginBottom: 'var(--spacing-4)', fontSize: 14 }}>{erro}</p>}
          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
