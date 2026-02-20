/**
 * Enums mapeados dos Domains GeneXus (domains.json)
 * Origem: gxmetadata/domains.json
 */

export enum Perfil {
  AdminGX2 = 1,
  AdminEmpresa = 2,
  Coordenador = 3,
  Colaborador = 4,
  GestaoProjetos = 5,
}

export enum Situacao {
  Cadastrado = 1,
  Cancelado = 2,
  Aprovado = 3,
}

export enum TipoApontamento {
  Normal = 1,
  Ferias = 2,
  AusenciaComAtestado = 3,
  AusenciaSemAtestado = 4,
  Falta = 5,
  Abono = 6,
  HoraExtra50 = 7,
  HoraExtra75 = 8,
  HoraExtra100 = 9,
  HoraExtraNormal = 10,
}

export enum OrigemApontamento {
  Mobile = 'M',
  Web = 'W',
}

export enum EvTipo {
  Feriado = 1,
  Ferias = 2,
  FeriasColetivas = 3,
  PeriodoReduzido = 4,
  Outro = 5,
  Atestado = 6,
}

export enum Abrangencia {
  Sistema = 1,
  Empresa = 2,
  Usuario = 3,
}

export enum DMStatusProjeto {
  Previsto = 'R',
  AguardandoInicio = 'I',
  EmAndamento = 'A',
  Parado = 'P',
  Encerrado = 'E',
}

export enum DMTipo {
  Outsourcing = 'O',
  LabsEscopoFechado = 'E',
  LabsSquadGerenciada = 'S',
  LabsConcepcao = 'C',
  LabsSustentacao = 'U',
  LabsConsultoria = 'N',
}

export enum Status {
  Aberta = 'A',
  Finalizada = 'F',
}
