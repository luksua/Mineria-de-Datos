import React from 'react';
import { useApp, type ActiveView } from '../../context/AppContext';
import {
  Compass,
  LayoutDashboard,
  Layers,
  Search,
  FileCode2,
  BookOpen,
  Map as MapIcon,
  Award,
  ChevronDown,
} from 'lucide-react';
import type { Role } from '../../types/domain';

export const Navbar: React.FC = () => {
  const { mode, setMode, activeView, setActiveView, user, changeRole, level, xp } = useApp();

  const navItems: { view: ActiveView; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { view: 'units', label: 'Unidades', icon: <Layers size={18} /> },
    { view: 'search', label: 'Buscador', icon: <Search size={18} /> },
    { view: 'latex', label: 'Lab LaTeX', icon: <FileCode2 size={18} /> },
    { view: 'manual', label: 'Manual', icon: <BookOpen size={18} /> },
  ];

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Logotipo / Marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--c-interactive), var(--c-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Compass size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Ruta del Conocimiento
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Minería de Datos v2
            </div>
          </div>
        </div>

        {/* Selector de Modo (Mapa | Directo) - Regla 3 */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-deep)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('direct')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: mode === 'direct' ? 'var(--c-interactive)' : 'transparent',
              color: mode === 'direct' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutDashboard size={14} />
            Directo
          </button>
          <button
            type="button"
            onClick={() => setMode('map')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: mode === 'map' ? 'var(--c-interactive)' : 'transparent',
              color: mode === 'map' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            <MapIcon size={14} />
            Mapa RPG
          </button>
        </div>

        {/* Navegación Directa */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const active = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => setActiveView(item.view)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  backgroundColor: active ? 'var(--c-interactive-bg)' : 'transparent',
                  color: active ? 'var(--c-interactive-hover)' : 'var(--text-dim)',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Gamificación & Rol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Insignia de Nivel y Rango */}
          <div
            className="badge badge-gold"
            title={`XP Real: ${xp} | Próximo nivel: ${level.xpSiguienteNivel} XP`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            <Award size={14} />
            <span>Niv. {level.nivel} · {level.rango}</span>
            <span style={{ opacity: 0.75, marginLeft: '0.2rem' }}>({xp} XP)</span>
          </div>

          {/* Selector de Rol */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={user.rol}
              onChange={(e) => changeRole(e.target.value as Role)}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 1.75rem 0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="estudiante">Rol: Estudiante</option>
              <option value="docente">Rol: Docente</option>
              <option value="administrador">Rol: Administrador</option>
            </select>
            <ChevronDown
              size={12}
              style={{
                position: 'absolute',
                right: '0.5rem',
                pointerEvents: 'none',
                color: 'var(--text-muted)',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
