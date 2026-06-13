// src/pages/Login.tsx
// Login simples com senha fixa — sem banco de dados
// A senha fica no próprio código por enquanto
// Se quiser mudar, só altera a constante SENHA_CORRETA

import { useState } from 'react'

const SENHA_CORRETA = 'multilaser2024' // ← muda aqui quando quiser

type LoginProps = {
  onLogin: (nome: string, email: string) => void
}

function Login({ onLogin }: LoginProps) {
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState(false)
  const [loading, setLoading] = useState(false)

  function handleEntrar() {
    if (!senha) return
    setLoading(true)
    
    // Pequeno delay para não parecer instantâneo demais
    setTimeout(() => {
      if (senha === SENHA_CORRETA) {
        onLogin('Usuário Multilaser', 'multilaser@multilaser.com.br')
      } else {
        setErro(true)
        setLoading(false)
        setSenha('')
      }
    }, 400)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleEntrar()
    if (erro) setErro(false)
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a2463 0%, #1251aa 60%, #1d4ed8 100%)',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>

      {/* Card de login */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 36px',
        width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, background: '#0a2463', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 20, color: '#fff'
          }}>M</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0a2463' }}>Multilaser</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Dashboard de Custos Extras</div>
          </div>
        </div>

        {/* Título */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
          Acesso restrito
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
          Digite a senha para acessar o dashboard
        </p>

        {/* Campo senha */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            SENHA
          </label>
          <input
            type="password"
            placeholder="••••••••••••"
            value={senha}
            onChange={e => { setSenha(e.target.value); setErro(false) }}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: '100%', padding: '11px 14px', fontSize: 14,
              border: `1.5px solid ${erro ? '#ef4444' : '#e2e8f0'}`,
              borderRadius: 8, outline: 'none', boxSizing: 'border-box',
              background: erro ? '#fef2f2' : '#fff',
              color: '#0f172a', transition: 'border 0.15s'
            }}
          />
          {erro && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>
              Senha incorreta. Tente novamente.
            </p>
          )}
        </div>

        {/* Botão */}
        <button
          onClick={handleEntrar}
          disabled={loading || !senha}
          style={{
            width: '100%', padding: '12px', fontSize: 14, fontWeight: 600,
            background: loading || !senha ? '#93c5fd' : '#0a2463',
            color: '#fff', border: 'none', borderRadius: 8,
            cursor: loading || !senha ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s'
          }}
        >
          {loading ? 'Verificando...' : 'Entrar'}
        </button>

        <p style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 20 }}>
          Multilaser Industrial S.A. — uso interno
        </p>
      </div>
    </div>
  )
}

export default Login