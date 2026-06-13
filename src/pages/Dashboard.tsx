import { useMemo, useState } from 'react'
import type { CustoExtra } from '../types'
import { contarPorStatus, totalValorServico, formatarMoeda, getPrioridades, parseMoeda, normalizarData } from '../utils/calculos'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'
import { Search } from 'lucide-react'

type DashboardProps = { dados: CustoExtra[] }

const T = {
  bg:          '#f0f4f8',
  card:        '#ffffff',
  primary:     '#1251aa',
  primaryDark: '#0a2463',
  border:      '#dde3ed',
  text:        '#0f172a',
  textMuted:   '#64748b',
  textLight:   '#94a3b8',
  success:     '#059669',
  warning:     '#d97706',
  danger:      '#dc2626',
  info:        '#2563eb',
  purple:      '#7c3aed',
}

const CORES_STATUS: Record<string, string> = {
  'Pendente Análise': T.warning,
  'Pend. Customer':   T.info,
  'Pend. Transport.': T.purple,
  'Autorizado':       T.success,
  'Não Autorizado':   T.danger,
  'Aut. c/ Desconto': '#06b6d4',
}

const tdS: React.CSSProperties = { padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap' }

type KpiCardProps = { label: string; valor: string; bg: string; destaque?: boolean }
function KpiCard({ label, valor, bg, destaque }: KpiCardProps) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '16px 18px', boxShadow: destaque ? '0 0 0 3px #fcd34d' : 'none', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -8, top: -8, width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.5px' }}>{label.toUpperCase()}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{valor}</p>
    </div>
  )
}

function Dashboard({ dados }: DashboardProps) {
  const [filtroTransp, setFiltroTransp]   = useState('todos')
  const [filtroServico, setFiltroServico] = useState('todos')
  const [filtroOfensor, setFiltroOfensor] = useState('todos')
  const [filtroStatus, setFiltroStatus]   = useState('todos')
  const [busca, setBusca]                 = useState('')

  const transportadoras = useMemo(() =>
    ['todos', ...Array.from(new Set(dados.map(r => r.transportadora).filter(Boolean))).sort()], [dados])
  const servicos = useMemo(() =>
    ['todos', ...Array.from(new Set(dados.map(r => r.descricaoServico).filter(Boolean))).sort()], [dados])
  const ofensores = useMemo(() =>
    ['todos', ...Array.from(new Set(dados.map(r => r.ofensor).filter(Boolean))).sort()], [dados])
  const statusOptions = useMemo(() =>
    ['todos', ...Array.from(new Set(dados.map(r => r.statusMulti).filter(Boolean))).sort()], [dados])

  const dadosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    return dados.filter(r => {
      const okTransp  = filtroTransp  === 'todos' || r.transportadora  === filtroTransp
      const okServico = filtroServico === 'todos' || r.descricaoServico === filtroServico
      const okOfensor = filtroOfensor === 'todos' || r.ofensor          === filtroOfensor
      const okStatus  = filtroStatus  === 'todos' || r.statusMulti      === filtroStatus
      const okBusca   = !termo ||
        r.transportadora.toLowerCase().includes(termo) ||
        r.nf.toLowerCase().includes(termo) ||
        r.destinatario.toLowerCase().includes(termo) ||
        r.descricaoServico.toLowerCase().includes(termo)
      return okTransp && okServico && okOfensor && okStatus && okBusca
    })
  }, [dados, filtroTransp, filtroServico, filtroOfensor, filtroStatus, busca])

  const contadores    = useMemo(() => contarPorStatus(dadosFiltrados), [dadosFiltrados])
  const totalGeral    = useMemo(() => totalValorServico(dadosFiltrados), [dadosFiltrados])
  const prioridades   = useMemo(() => getPrioridades(dadosFiltrados), [dadosFiltrados])
  const totalPendente = useMemo(() => prioridades.reduce((a, r) => a + parseMoeda(r.valorServico), 0), [prioridades])

  const dadosPizza = [
    { name: 'Pendente Análise', value: contadores.pendente },
    { name: 'Pend. Customer',   value: contadores.pendenteCustomer },
    { name: 'Pend. Transport.', value: contadores.pendenteTransportadora },
    { name: 'Autorizado',       value: contadores.autorizado },
    { name: 'Não Autorizado',   value: contadores.naoAutorizado },
    { name: 'Aut. c/ Desconto', value: contadores.autorizadoComDesconto },
  ].filter(d => d.value > 0)

  const dadosBarras = useMemo(() => {
    const map: Record<string, number> = {}
    dadosFiltrados.forEach(r => {
      map[r.transportadora] = (map[r.transportadora] || 0) + parseMoeda(r.valorServico)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)
  }, [dadosFiltrados])

  // Tendência mensal — últimos 12 meses
  const porMesDash = useMemo(() => {
    const map: Record<string, { mes: string, total: number }> = {}
    dadosFiltrados.forEach(r => {
      const data = normalizarData(r.dataInsercao)
      if (!data || data.length < 10) return
      const partes = data.split('/')
      const m = partes[1]
      const y = partes[2]
      if (!m || !y) return
      const chave = `${y}-${m}`
      if (!map[chave]) map[chave] = { mes: `${m}/${y.slice(2)}`, total: 0 }
      map[chave].total += parseMoeda(r.valorServico)
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, v]) => ({ ...v, total: Math.round(v.total) }))
  }, [dadosFiltrados])

  // Tabela colateral — aparece só quando filtra por status
  const tabelaColateral = useMemo(() => {
    if (filtroStatus === 'todos') return []
    const map: Record<string, number> = {}
    dadosFiltrados.forEach(r => {
      map[r.transportadora] = (map[r.transportadora] || 0) + parseMoeda(r.valorServico)
    })
    return Object.entries(map)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
  }, [dadosFiltrados, filtroStatus])

  const temFiltro = filtroTransp !== 'todos' || filtroServico !== 'todos' ||
    filtroOfensor !== 'todos' || filtroStatus !== 'todos' || busca !== ''

  const sel: React.CSSProperties = {
    background: T.card, color: T.text, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer',
    outline: 'none', minWidth: 160,
  }

  const tooltipStyle = { background: T.primaryDark, border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: T.bg, minHeight: '100%', padding: 20 }}>

      {/* FILTROS */}
      <div style={{ background: T.card, borderRadius: 12, padding: '14px 16px', border: `1px solid ${T.border}`, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.textLight }} />
          <input type="text" placeholder="Buscar por transportadora, NF, destinatário..."
            value={busca} onChange={e => setBusca(e.target.value)}
            style={{ ...sel, width: '100%', paddingLeft: 32, boxSizing: 'border-box', minWidth: 0 }} />
        </div>
        <select style={sel} value={filtroTransp} onChange={e => setFiltroTransp(e.target.value)}>
          {transportadoras.map(t => <option key={t} value={t}>{t === 'todos' ? 'Todas transportadoras' : t}</option>)}
        </select>
        <select style={sel} value={filtroServico} onChange={e => setFiltroServico(e.target.value)}>
          {servicos.map(s => <option key={s} value={s}>{s === 'todos' ? 'Todos os serviços' : s}</option>)}
        </select>
        <select style={sel} value={filtroOfensor} onChange={e => setFiltroOfensor(e.target.value)}>
          {ofensores.map(o => <option key={o} value={o}>{o === 'todos' ? 'Todos os ofensores' : o}</option>)}
        </select>
        <select style={sel} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          {statusOptions.map(s => <option key={s} value={s}>{s === 'todos' ? 'Todos os status' : s}</option>)}
        </select>
        {temFiltro && (
          <button onClick={() => { setFiltroTransp('todos'); setFiltroServico('todos'); setFiltroOfensor('todos'); setFiltroStatus('todos'); setBusca('') }}
            style={{ padding: '7px 14px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, color: '#92400e', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Limpar ×
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: T.textMuted, whiteSpace: 'nowrap' }}>
          {dadosFiltrados.length.toLocaleString('pt-BR')} de {dados.length.toLocaleString('pt-BR')} registros
        </span>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        <KpiCard label="Total registros"      valor={dadosFiltrados.length.toLocaleString('pt-BR')} bg={T.primaryDark} />
        <KpiCard label="Pendente análise"     valor={contadores.pendente.toLocaleString('pt-BR')}   bg={T.warning} destaque />
        <KpiCard label="Pend. customer"       valor={contadores.pendenteCustomer.toLocaleString('pt-BR')} bg={T.info} />
        <KpiCard label="Pend. transportadora" valor={contadores.pendenteTransportadora.toLocaleString('pt-BR')} bg={T.purple} />
        <KpiCard label="Autorizados"          valor={contadores.autorizado.toLocaleString('pt-BR')} bg={T.success} />
        <KpiCard label="Não autorizados"      valor={contadores.naoAutorizado.toLocaleString('pt-BR')} bg={T.danger} />
      </div>

      {/* VALOR EXPOSTO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: T.primaryDark, borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 500, letterSpacing: '0.5px' }}>VALOR TOTAL EXPOSTO</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{formatarMoeda(totalGeral)}</p>
        </div>
        <div style={{ background: '#7c2d12', borderRadius: 12, padding: '16px 20px', boxShadow: '0 0 0 2px #f59e0b44' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 500, letterSpacing: '0.5px' }}>VALOR PENDENTE DE ANÁLISE</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: '#fbbf24' }}>{formatarMoeda(totalPendente)}</p>
        </div>
      </div>

      {/* GRÁFICOS — barras + pizza */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
        <div style={{ background: T.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Valor exposto por transportadora (R$) — Top 15</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosBarras} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.textMuted }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: T.textMuted }} />
              <Tooltip formatter={(v: unknown) => formatarMoeda(Number(v))} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {dadosBarras.map((_, i) => (
                  <Cell key={i} fill={[T.primary,'#1d4ed8',T.purple,T.success,T.danger,T.warning,'#06b6d4'][i % 7]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Distribuição por status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dadosPizza} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={75} innerRadius={38}>
                {dadosPizza.map((entry) => (
                  <Cell key={entry.name} fill={CORES_STATUS[entry.name] || T.primary} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: T.textMuted }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICO DE ÁREA — tendência mensal */}
      <div style={{ background: T.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${T.border}` }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Tendência de custos — últimos 12 meses</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={porMesDash} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="gradDash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1251aa" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1251aa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: T.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: T.textMuted }} />
            <Tooltip formatter={(v: unknown) => formatarMoeda(Number(v))} contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="total" stroke="#1251aa" strokeWidth={2.5}
              fill="url(#gradDash)" dot={{ fill: '#1251aa', r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* TABELA COLATERAL — aparece só quando filtra por status */}
      {tabelaColateral.length > 0 && (
        <div style={{ background: T.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>
            Transportadoras com status: <span style={{ color: T.primary }}>{filtroStatus}</span>
            <span style={{ marginLeft: 8, background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>
              {tabelaColateral.length} transportadoras
            </span>
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${T.border}` }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: T.textMuted, fontSize: 11, fontWeight: 600 }}>TRANSPORTADORA</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: T.textMuted, fontSize: 11, fontWeight: 600 }}>VALOR TOTAL</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: T.textMuted, fontSize: 11, fontWeight: 600 }}>% DO TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {tabelaColateral.map((t, i) => {
                const totalCol = tabelaColateral.reduce((a, x) => a + x.valor, 0)
                const pct = totalCol > 0 ? ((t.valor / totalCol) * 100).toFixed(1) : '0'
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ background: '#e0e7ff', color: T.primaryDark, padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 11 }}>{t.nome}</span>
                    </td>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: T.primaryDark }}>{formatarMoeda(t.valor)}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: T.primary, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: T.textMuted, width: 36 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TABELA DE PRIORIDADES */}
      <div style={{ background: T.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${T.border}` }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>
          Fila de prioridade — pendentes mais antigos
          <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
            {prioridades.length} registros
          </span>
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${T.border}` }}>
                {['Transportadora','Data inserção','NF','Destinatário','Serviço','Valor serviço','Status Multi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: T.textMuted, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 11, letterSpacing: '0.3px' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prioridades.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: T.textLight }}>
                  Nenhum registro pendente com os filtros atuais
                </td></tr>
              )}
              {prioridades.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={tdS}><span style={{ background: '#e0e7ff', color: T.primaryDark, padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontSize: 11 }}>{r.transportadora}</span></td>
                  <td style={{ ...tdS, color: T.warning, fontWeight: 700 }}>{normalizarData(r.dataInsercao)}</td>
                  <td style={{ ...tdS, fontFamily: 'monospace', color: T.text }}>{r.nf}</td>
                  <td style={{ ...tdS, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.destinatario}</td>
                  <td style={tdS}>{r.descricaoServico}</td>
                  <td style={{ ...tdS, fontWeight: 700, color: T.primaryDark }}>{r.valorServico}</td>
                  <td style={tdS}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                      background: !r.statusMulti ? '#fef3c7' : '#f1f5f9',
                      color:      !r.statusMulti ? '#92400e' : T.textMuted
                    }}>{r.statusMulti || 'PENDENTE DE ANÁLISE'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard