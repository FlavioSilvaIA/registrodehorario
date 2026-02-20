/**
 * Auth Controller - Equivalente a PrcValidaLoginUsuario (ValidaLogin)
 * Origem: registrohorario.gxapp.json, Metadata/TableAccess/ValidaLogin.xml
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models';
import { JWT_SECRET } from '../middleware/auth';
import type { JwtPayload } from '../middleware/auth';

export async function login(req: Request, res: Response) {
  try {
    const { usuarioLogin, usuarioSenha } = req.body;
    if (!usuarioLogin || !usuarioSenha) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }
    const usuario = await Usuario.findOne({ where: { usuarioLogin } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const valid = await bcrypt.compare(usuarioSenha, usuario.usuarioSenha);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    if (!usuario.usuarioAtivo) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }
    const token = jwt.sign(
      { usuarioId: usuario.usuarioId, usuarioLogin: usuario.usuarioLogin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      usuario: {
        usuarioId: usuario.usuarioId,
        usuarioNome: usuario.usuarioNome,
        usuarioLogin: usuario.usuarioLogin,
        usuarioPerfil: usuario.usuarioPerfil,
        usuarioEmpresaId: usuario.usuarioEmpresaId,
        equipeId: usuario.equipeId,
        usuarioFotoBase64: usuario.usuarioFotoBase64 || null,
        usuarioFotoExtensao: usuario.usuarioFotoExtensao || 'jpeg',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
}

export async function me(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const usuario = await Usuario.findByPk(req.user!.usuarioId, {
      attributes: ['usuarioId', 'usuarioNome', 'usuarioLogin', 'usuarioPerfil', 'usuarioEmpresaId', 'equipeId', 'usuarioFotoBase64', 'usuarioFotoExtensao'],
    });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ usuario: usuario.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}
