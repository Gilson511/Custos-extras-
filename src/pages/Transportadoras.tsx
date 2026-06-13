import { useMemo } from 'react'
import type { CustoExtra } from '../types'
import { parseMoeda, formatarMoeda, contarPorStatus } from '../utils/calculos'

type Props = { dados: CustoExtra[] }

export default function Transportadoras({ dados }: Props) {
  const porTransportadora = useMemo(() => {
    const map: Record<string, CustoExtra[]> = {}
    dados.forEach(r => {
      if (!map[r.transportadora]) map[r.transportadora] = []
      map[r.transportadora].push(r)
    })
    return Object.entries(map)
      .map(([nome, registros]) => ({
        nome,
        total: registros.length,
        valorTotal: registros.reduce((a, r) => a + parseMoeda(r.valorServico), 0),
        contadores: contarPorStatus(registros),
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal)
  }, [dados])

  const pill = (bg: string, color: string, texto: string | number) => (
    <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
      {texto}
    </span>
  )

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0a2463', margin: 0 }}>Transportadoras</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>{porTransportadora.length} transportadoras ativas</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dde3ed', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#0a2463' }}>
              {['#','Transportadora','Registros','Valor exposto','Pendente','Customer','Autorizado','Não aut.'].map(h => (
                <th key={h} style={{ padding: '12px 14px', color: '#fff', fontWeight: 600, fontSize: 11, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {porTransportadora.map((t, i) => (
              <tr key={t.nome}
                style={{ borderBottom: '1px solid #f1f5f9' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 14px', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: '#e0e7ff', color: '#0a2463', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{t.nome}</span>
                </td>
                <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>{t.total.toLocaleString('pt-BR')}</td>
                <td style={{ padding: '10px 14px', color: '#0a2463', fontWeight: 700 }}>{formatarMoeda(t.valorTotal)}</td>
                <td style={{ padding: '10px 14px' }}>{pill('#fef3c7','#92400e', t.contadores.pendente)}</td>
                <td style={{ padding: '10px 14px' }}>{pill('#dbeafe','#1e40af', t.contadores.pendenteCustomer)}</td>
                <td style={{ padding: '10px 14px' }}>{pill('#dcfce7','#166534', t.contadores.autorizado)}</td>
                <td style={{ padding: '10px 14px' }}>{pill('#fee2e2','#991b1b', t.contadores.naoAutorizado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}