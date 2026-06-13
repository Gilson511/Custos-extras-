import { useState, useEffect, useCallback, useRef } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transportadoras from './pages/Transportadoras'
import Analises from './pages/Analises'
import { buscarDados } from './services/api'
import type { CustoExtra } from './types'

type Usuario = { nome: string }
type EstadoDados = 'idle' | 'carregando' | 'atualizando' | 'ok' | 'erro'
const INTERVALO_MS = 5 * 60 * 1000

function App() {
  const [usuario, setUsuario]                     = useState<Usuario | null>(null)
  const [dados, setDados]                         = useState<CustoExtra[]>([])
  const [estado, setEstado]                       = useState<EstadoDados>('idle')
  const [erroMsg, setErroMsg]                     = useState('')
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)
  const [contador, setContador]                   = useState(INTERVALO_MS / 1000)
  const [pagina, setPagina]                       = useState('dashboard')
  const silenciosoRef                             = useRef(false)

  const carregar = useCallback(async () => {
    setEstado(silenciosoRef.current ? 'atualizando' : 'carregando')
    try {
      const resultado = await buscarDados()
      setDados(resultado)
      setEstado('ok')
      setUltimaAtualizacao(new Date())
      setContador(INTERVALO_MS / 1000)
    } catch (e) {
      setErroMsg(String(e))
      setEstado('erro')
    }
  }, [])

  useEffect(() => {
    if (!usuario) return
    silenciosoRef.current = false
    carregar()
  }, [usuario]) // eslint-disable-line

  useEffect(() => {
    if (!usuario) return
    const intervalo = setInterval(() => {
      silenciosoRef.current = true
      carregar()
    }, INTERVALO_MS)
    return () => clearInterval(intervalo)
  }, [usuario]) // eslint-disable-line

  useEffect(() => {
    if (!ultimaAtualizacao) return
    const tick = setInterval(() => {
      setContador(prev => (prev <= 1 ? INTERVALO_MS / 1000 : prev - 1))
    }, 1000)
    return () => clearInterval(tick)
  }, [ultimaAtualizacao])

  const formatarHorario = (data: Date) =>
    data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const formatarContador = (s: number) => {
    const m = Math.floor(s / 60)
    const seg = s % 60
    return `${m}:${String(seg).padStart(2, '0')}`
  }

  if (!usuario) return <Login onLogin={(nome) => setUsuario({ nome })} />

  if (estado === 'carregando') {
    return (
      <Layout nomeUsuario={usuario.nome} onLogout={() => setUsuario(null)} paginaAtiva={pagina} onMudarPagina={setPagina}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
          <div style={{ width: 44, height: 44, border: '3px solid #dde3ed', borderTop: '3px solid #1251aa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>Carregando dados...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </Layout>
    )
  }

  if (estado === 'erro') {
    return (
      <Layout nomeUsuario={usuario.nome} onLogout={() => setUsuario(null)} paginaAtiva={pagina} onMudarPagina={setPagina}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
          <p style={{ color: '#dc2626', fontSize: 15, fontWeight: 600 }}>Erro ao carregar dados</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{erroMsg}</p>
          <button onClick={() => { silenciosoRef.current = false; carregar() }}
            style={{ padding: '10px 24px', background: '#0a2463', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Tentar novamente
          </button>
        </div>
      </Layout>
    )
  }

  const renderPagina = () => {
    if (pagina === 'transportadoras') return <Transportadoras dados={dados} />
    if (pagina === 'analises') return <Analises dados={dados} />
    return <Dashboard dados={dados} />
  }

  return (
    <Layout nomeUsuario={usuario.nome} onLogout={() => setUsuario(null)} paginaAtiva={pagina} onMudarPagina={setPagina}>
      {ultimaAtualizacao && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, padding: '5px 24px', fontSize: 12, background: '#fff', borderBottom: '1px solid #dde3ed' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: estado === 'atualizando' ? '#d97706' : '#059669', fontWeight: 600 }}>
            <span style={{ fontSize: 8 }}>●</span>
            {estado === 'atualizando' ? 'Atualizando...' : 'Online'}
          </span>
          <span style={{ color: '#94a3b8' }}>Última atualização: <strong style={{ color: '#475569' }}>{formatarHorario(ultimaAtualizacao)}</strong></span>
          <span style={{ color: '#94a3b8' }}>Próxima em: <strong style={{ color: '#475569' }}>{formatarContador(contador)}</strong></span>
          <span style={{ color: '#cbd5e1' }}>{dados.length.toLocaleString('pt-BR')} registros</span>
          <button onClick={() => { silenciosoRef.current = true; carregar() }}
            style={{ marginLeft: 'auto', padding: '4px 14px', background: '#f0f4f8', border: '1px solid #dde3ed', borderRadius: 6, color: '#64748b', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>
            ↻ Atualizar agora
          </button>
        </div>
      )}
      {renderPagina()}
    </Layout>
  )
}

export default App