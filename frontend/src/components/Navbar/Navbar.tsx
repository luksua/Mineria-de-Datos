import React from 'react';
import { useApp, type ActiveView } from '../../context/AppContext';
import {
  Compass,
  LayoutDashboard,
  Layers,
  Search,
  FileCode2,
  BookOpen,
  Cog,
  Palette,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { mode, setMode, activeView, setActiveView, closeTopic, selectedTopic } = useApp();

  const navItems: { view: ActiveView; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { view: 'units', label: 'Unidades', icon: <Layers size={16} /> },
    { view: 'search', label: 'Buscador', icon: <Search size={16} /> },
    { view: 'latex', label: 'Lab LaTeX', icon: <FileCode2 size={16} /> },
    { view: 'manual', label: 'Manual', icon: <BookOpen size={16} /> },
    { view: 'uikit', label: 'UI Kit', icon: <Palette size={16} /> },
  ];

  return (
    <header
      style={{
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-atlas-xs)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          flexWrap: 'nowrap',
          overflowX: 'auto',
        }}
      >
        {/* Logotipo / Marca sobria tipo Atlas */}
        <div
          onClick={() => {
            closeTopic();
            setActiveView('dashboard');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-blue-soft)',
              border: '1px solid var(--color-blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-blue-ink)',
            }}
          >
            <Compass size={18} />
          </div>
          <div>
            <div
              className="atlas-title"
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--color-ink)',
                letterSpacing: '-0.01em',
                lineHeight: 1.15,
              }}
            >
              La Máquina de Minería
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-sans)' }}>
              Ruta del Conocimiento
            </div>
          </div>
        </div>

        {/* Selector de Modo (La Máquina | Directo) - AGENTS.md §1 & §4 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-card-muted)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setMode('map')}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: mode === 'map' ? 'var(--color-terracotta)' : 'transparent',
              color: mode === 'map' ? '#FFFFFF' : 'var(--color-ink-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Cog size={13} />
            <span>La Máquina</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('direct')}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: mode === 'direct' ? 'var(--color-blue-ink)' : 'transparent',
              color: mode === 'direct' ? '#FFFFFF' : 'var(--color-ink-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <LayoutDashboard size={13} />
            <span>Directo</span>
          </button>
        </div>

        {/* Navegación mínima */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0,
          }}
        >
          {navItems.map((item) => {
            const active = !selectedTopic && activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => {
                  closeTopic();
                  setActiveView(item.view);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: active ? 'var(--color-border)' : 'transparent',
                  fontSize: '0.8125rem',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  backgroundColor: active ? 'var(--color-card-muted)' : 'transparent',
                  color: active ? 'var(--color-terracotta)' : 'var(--color-ink-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
