import { useState } from 'react'
import { LayoutDashboard, Truck, FileText, Settings, LogOut, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'

type LayoutProps = {
  children: React.ReactNode
  nomeUsuario: string
  onLogout: () => void
  paginaAtiva: string
  onMudarPagina: (pagina: string) => void
}

type MenuItem = { id: string; label: string; icon: React.ReactNode };

function Layout({ children, nomeUsuario, onLogout, paginaAtiva, onMudarPagina }: LayoutProps) {
  const [collapsed, setCollapsed]   = useState(false)
  const [temaEscuro, setTemaEscuro] = useState(false)

  const menus: MenuItem[] = [
    { id: 'dashboard',       label: 'Dashboard',       icon: <LayoutDashboard size={18} /> },
    { id: 'transportadoras', label: 'Transportadoras', icon: <Truck size={18} /> },
    { id: 'analises',        label: 'Análises',        icon: <FileText size={18} /> },
    { id: 'configuracoes',   label: 'Configurações',   icon: <Settings size={18} /> },
  ]

  const larguraSidebar = collapsed ? 64 : 220

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{
        width: larguraSidebar, flexShrink: 0,
        background: 'linear-gradient(180deg, #0a2463 0%, #1251aa 100%)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease', overflow: 'hidden',
        boxShadow: '2px 0 12px rgba(10,36,99,0.3)'
      }}>
        <div style={{ padding: '18px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#fff', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#0a2463' }}>M</div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', whiteSpace: 'nowrap' }}>Multilaser</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>Custos Extras</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {menus.map(item => (
            <button key={item.id} onClick={() => onMudarPagina(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              marginBottom: 2, whiteSpace: 'nowrap', fontSize: 13, textAlign: 'left',
              transition: 'all 0.15s',
              background: paginaAtiva === item.id ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: paginaAtiva === item.id ? '#fff' : 'rgba(255,255,255,0.6)',
              fontWeight: paginaAtiva === item.id ? 600 : 400,
              borderLeft: paginaAtiva === item.id ? '3px solid #60a5fa' : '3px solid transparent',
            }}>
              {item.icon}
              {!collapsed && item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => setTemaEscuro(!temaEscuro)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
            {temaEscuro ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && (temaEscuro ? 'Tema claro' : 'Tema escuro')}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && 'Recolher menu'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 54, background: '#0a2463', borderBottom: '1px solid #1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, boxShadow: '0 2px 8px rgba(10,36,99,0.2)' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Custos Extras — Transportadoras</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {nomeUsuario.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{nomeUsuario}</span>
            <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 12 }}>
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: temaEscuro ? '#0f172a' : '#f0f4f8' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout