/**
 * Admin Controller - Estatísticas para visão completa do administrador
 * Origem: RB-013 (Perfis AdminGX2, AdminEmpresa, Coordenador)
 */
import { Request, Response } from 'express';
import { Usuario, Projeto, Reembolso, Apontamento } from '../models';

export async function getStats(req: Request, res: Response) {
  try {
    const [totalUsuarios, totalProjetos, reembolsosPendentes, apontamentosHoje] = await Promise.all([
      Usuario.count({ where: { usuarioAtivo: true } }),
      Projeto.count({ where: { projetoAtivo: true } }),
      Reembolso.count({ where: { reembolsoSituacao: 1 } }),
      Apontamento.count({
        where: {
          apontamentoData: new Date().toISOString().split('T')[0],
          apontamentoSituacao: 1,
        },
      }),
    ]);
    res.json({
      totalUsuarios,
      totalProjetos,
      reembolsosPendentes,
      apontamentosHoje,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
}
