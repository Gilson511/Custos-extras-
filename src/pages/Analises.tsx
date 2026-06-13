import { useMemo } from 'react'
import type { CustoExtra } from '../types'
import { parseMoeda, formatarMoeda, normalizarData } from '../utils/calculos'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

type Props = { dados: CustoExtra[] }

export default function Analises({ dados }: Props) {

  // Ranking por custo
  const ranking = useMemo(() => {
    const map: Record<string, number> = {}
    dados.forEach(r => {
      map[r.transportadora] = (map[r.transportadora] || 0) + parseMoeda(r.valorServico)
    })
    return Object.entries(map)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 15)
  }, [dados])

  // Por mês — últimos 12 meses
  const porMes = useMemo(() => {
    const map: Record<string, { mes: string, total: number, count: number }> = {}
    dados.forEach(r => {
      const data = normalizarData(r.dataInsercao)
      if (!data || data.length < 7) return
      const [, m, y] = data.split('/')
      if (!m || !y) return
      const chave = `${y}-${m}`
      const label = `${m}/${y.slice(2)}`
      if (!map[chave]) map[chave] = { mes: label, total: 0, count: 0 }
      map[chave].total += parseMoeda(r.valorServico)
      map[chave].count += 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, v]) => ({ ...v, total: Math.round(v.total) }))
  }, [dados])

  // Por ano
  const porAno = useMemo(() => {
    const map: Record<string, { ano: string, total: number, count: number }> = {}
    dados.forEach(r => {
      const data = normalizarData(r.dataInsercao)
      if (!data || data.length < 10) return
      const ano = data.split('/')[2]
      if (!ano) return
      if (!map[ano]) map[ano] = { ano, total: 0, count: 0 }
      map[ano].total += parseMoeda(r.valorServico)
      map[ano].count += 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ ...v, total: Math.round(v.total) }))
  }, [dados])

  const mediaMensal = porMes.length > 0
    ? porMes.reduce((a, m) => a + m.total, 0) / porMes.length
    : 0

  const mediaCount = porMes.length > 0
    ? porMes.reduce((a, m) => a + m.count, 0) / porMes.length
    : 0

  const tooltipStyle = { background: '#0a2463', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }
  const card = (titulo: string, conteudo: React.ReactNode) => (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dde3ed', padding: '16px 18px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>{titulo}</p>
      {conteudo}
    </div>
  )

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0a2463', margin: 0 }}>Análises</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Visão mensal, anual e ranking de custos</p>
      </div>

      {/* Cards de média */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {[
          { label: 'Média mensal (R$)', valor: formatarMoeda(mediaMensal), bg: '#0a2463' },
          { label: 'Média de registros/mês', valor: Math.round(mediaCount).toLocaleString('pt-BR'), bg: '#1251aa' },
          { label: 'Total anos analisados', valor: String(porAno.length), bg: '#7c3aed' },
          { label: 'Total meses com dados', valor: String(porMes.length), bg: '#059669' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -8, top: -8, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.3px' }}>{c.label.toUpperCase()}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{c.valor}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de área — evolução mensal */}
      {card('Evolução de custos — últimos 12 meses',
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={porMes} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="gradMensal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1251aa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1251aa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip formatter={(v: unknown) => formatarMoeda(Number(v))} contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="total" stroke="#1251aa" strokeWidth={2.5} fill="url(#gradMensal)" dot={{ fill: '#1251aa', r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Gráfico de área — evolução anual */}
      {card('Evolução de custos — por ano',
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={porAno} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="gradAnual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="ano" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip formatter={(v: unknown) => formatarMoeda(Number(v))} contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={2.5} fill="url(#gradAnual)" dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Ranking */}
      {card('Ranking — transportadoras que mais geraram custo',
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ranking} layout="vertical" margin={{ top: 4, right: 60, left: 80, bottom: 4 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: '#475569' }} width={80} />
            <Tooltip formatter={(v: unknown) => formatarMoeda(Number(v))} contentStyle={tooltipStyle} />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {ranking.map((_, i) => (
                <Cell key={i} fill={['#0a2463','#1251aa','#2563eb','#3b82f6','#60a5fa','#93c5fd'][Math.min(i, 5)]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}