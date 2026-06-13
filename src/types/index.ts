// src/types/index.ts
// Aqui ficam TODOS os tipos do projeto.
// Um "type" no TypeScript é um contrato — garante que os dados
// sempre terão a forma esperada. Se faltar uma coluna ou o tipo
// estiver errado, o TypeScript avisa ANTES de rodar.

export type StatusMulti = 
  | 'AUTORIZADO'
  | 'NÃO AUTORIZADO' 
  | 'AUTORIZADO COM DESCONTO'
  | 'PENDENTE MULTILASER'
  | 'PENDENTE CUSTOMER'
  | 'PENDENTE TRANSPORTADORA'

export type CustoExtra = {
  transportadora: string          // "PACIFICO"
  dataInsercao: string            // "26/04/2024"
  responsavelTransportadora: string // "Brenda Fernandes"
  cnpjRemetente: string           // "59717553000617"
  remetente: string               // "MULTILASER INDUSTRIAL S.A."
  nf: string                      // "1408031"
  valorNf: string                 // "R$ 55.491,18"
  cte: string                     // "1533460"
  emissaoCte: string              // "02/04/2024"
  origemCte: string               // "29/02/2024"
  dataPrevistaEntrega: string     // "01/04/2024"
  destinatario: string            // "GAZIN IND E COM..."
  municipioDestinatario: string   // "SANTAREM"
  ufDestinatario: string          // "PA"
  dataStatus: string              // "01/04/2024"
  status: string                  // "ENTREGUE CLIENTE"
  descricaoServico: string        // "DESCARGA"
  tipoVeiculo: string             // "TOCO" ou vazio
  responsavelAutorizacao: string  // "ELIS"
  periodoServico: string          // vazio na maioria
  valorServico: string            // "R$ 30,00"
  statusMulti: StatusMulti        // "AUTORIZADO"
  responsavelMulti: string        // "ELIS"
  dataRetorno: string             // "20/05/2024"
  observacao: string              
  diasArmazenados: number         // 0
  ofensor: string                 // "CLIENTE"
  fatura: string                  // "1738050"
  emissaoFatura: string           // "08/04/2024"
  vencimentoFatura: string        // "06/06/2024"
  observacaoTransportadora: string
  statusTransportadora: string    // "LIQUIDADO"
  statusFinal: string             // "DE ACORDO"
  duplicidade: string             // "1408031"
  duplicidade2: string            // "DESCARGA"
}

// Tipo para agrupar dados por transportadora
export type DadosTransportadora = {
  nome: string
  registros: CustoExtra[]
}