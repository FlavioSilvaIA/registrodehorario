/**
 * AuthContext - Equivalente a Context/Session GeneXus
 * Origem: registrohorario.gxapp.json (Context: UsuarioId, UsuarioNome, UsuarioPerfil, EquipeId)
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface Usuario {
  usuarioId: number;
  usuarioNome: string;
  usuarioLogin: string;
  usuarioPerfil: number;
  usuarioEmpresaId?: number;
  equipeId?: number;
  usuarioFotoBase64?: string | null;
  usuarioFotoExtensao?: string | null;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (login: string, senha: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) setUsuario(JSON.parse(stored));
    const t = localStorage.getItem('token');
    if (t) {
      api.get('/auth/me').then(({ data }) => {
        if (data?.usuario) {
          setUsuario(data.usuario);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usuarioLogin: string, usuarioSenha: string) => {
    const { data } = await api.post('/auth/login', { usuarioLogin, usuarioSenha });
    setToken(data.token);
    setUsuario(data.usuario);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const refreshUsuario = async () => {
    const t = localStorage.getItem('token');
    if (!t) return;
    try {
      const { data } = await api.get('/auth/me');
      if (data?.usuario) {
        setUsuario(data.usuario);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }
    } catch (_) { /* ignora */ }
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, loading, refreshUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
