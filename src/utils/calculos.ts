import type { CustoExtra } from '../types'

export function parseMoeda(valor: string): number {
  if (!valor || typeof valor !== 'string') return 0

  const limpo = valor.replace(/[R$\s]/g, '').trim()
  if (!limpo) return 0

  // Detecta o formato automaticamente
  const temVirgula = limpo.includes(',')
  const temPonto   = limpo.includes('.')

  let normalizado: string

  if (temVirgula && temPonto) {
    // Formato BR: 1.234,56 → remove ponto, troca vírgula por ponto
    normalizado = limpo.replace(/\./g, '').replace(',', '.')
  } else if (temVirgula && !temPonto) {
    // Só vírgula: 1234,56 → troca por ponto
    normalizado = limpo.replace(',', '.')
  } else if (temPonto && !temVirgula) {
    // Só ponto: pode ser 903.23 (decimal) ou 1.234 (milhar)
    const partes = limpo.split('.')
    const ultimaParte = partes[partes.length - 1]
    if (ultimaParte.length <= 2) {
      // Ex: 903.23 — ponto é decimal, não mexe
      normalizado = limpo
    } else {
      // Ex: 1.234 — ponto é milhar, remove
      normalizado = limpo.replace(/\./g, '')
    }
  } else {
    // Sem separador: número inteiro
    normalizado = limpo
  }

  const num = parseFloat(normalizado)
  return isNaN(num) ? 0 : num
}

export function normalizarData(valor: string): string {
  if (!valor) return ''
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return valor
  const data = new Date(valor)
  if (isNaN(data.getTime())) return valor
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${data.getFullYear()}`
}

export function precisaAnalise(registro: CustoExtra): boolean {
  return (
    (!registro.statusMulti || registro.statusMulti === 'PENDENTE MULTILASER') &&
    !!registro.transportadora &&
    !!registro.nf &&
    !!registro.valorServico
  )
}

export function contarPorStatus(registros: CustoExtra[]) {
  return {
    pendente: registros.filter(r => precisaAnalise(r)).length,
    pendenteCustomer: registros.filter(r => r.statusMulti === 'PENDENTE CUSTOMER').length,
    pendenteTransportadora: registros.filter(r => r.statusMulti === 'PENDENTE TRANSPORTADORA').length,
    autorizado: registros.filter(r => r.statusMulti === 'AUTORIZADO').length,
    naoAutorizado: registros.filter(r => r.statusMulti === 'NÃO AUTORIZADO').length,
    autorizadoComDesconto: registros.filter(r => r.statusMulti === 'AUTORIZADO COM DESCONTO').length,
  }
}

export function totalValorServico(registros: CustoExtra[]): number {
  return registros.reduce((acc, r) => acc + parseMoeda(r.valorServico), 0)
}

export function formatarMoeda(valor: number): string {
  if (isNaN(valor)) return 'R$ 0,00'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function getPrioridades(registros: CustoExtra[]): CustoExtra[] {
  return registros
    .filter(precisaAnalise)
    .map(r => ({ ...r, dataInsercao: normalizarData(r.dataInsercao) }))
    .sort((a, b) => {
      const toDate = (s: string) => {
        if (!s) return new Date(0)
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
          const [d, m, y] = s.split('/')
          return new Date(`${y}-${m}-${d}`)
        }
        return new Date(s)
      }
      return toDate(a.dataInsercao).getTime() - toDate(b.dataInsercao).getTime()
    })
}