import React from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  BookOpen,
  FileText,
  Code2,
  FileCode,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AcademicDashboard: React.FC = () => {
  const { course, level, xp, achievements, setActiveView, openTopic } = useApp();

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0284c7', '#38bdf8', '#f59e0b', '#10b981'],
    });
  };

  const m = course?.metricas;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner de Bienvenida & Rango Académico */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
          borderLeft: '4px solid var(--c-interactive)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-blue">Plataforma Académica v2</span>
            <span className="badge badge-gold">
              <Sparkles size={12} /> Gamificación Sobria
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Panel de Control de Investigación
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem', maxWidth: '650px' }}>
            Ruta metodológica de 4 unidades académicas y 24 temas de investigación. Progreso calculado
            rigurosamente sobre fuentes científicas, scripts de laboratorio en R y compilación LaTeX.
          </p>
        </div>

        {/* Nivel & Barra de XP */}
        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-deep)',
            minWidth: '280px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rango Actual
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-gold)' }}>
                {level.rango} (Niv. {level.nivel})
              </div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--c-gold-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-gold)',
              }}
            >
              <Trophy size={20} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>{xp} XP Acumulados</span>
            <span>Meta: {level.xpSiguienteNivel} XP</span>
          </div>

          {/* Barra de Progreso XP */}
          <div
            style={{
              height: '6px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${level.porcentajeNivel}%`,
                height: '100%',
                backgroundColor: 'var(--c-gold)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Métricas Reales Clave */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--c-interactive-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-interactive-hover)' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{m?.totalBusquedas ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Búsquedas Booleanas</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--c-completed-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-completed)' }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{m?.documentosSeleccionados ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Documentos Seleccionados</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--c-secondary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-secondary)' }}>
              <Code2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{m?.ejemplosR ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Laboratorios en R</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--c-gold-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-gold)' }}>
              <FileCode size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{m?.documentosLatex ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capítulos en LaTeX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Las Cuatro Unidades Curriculares */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recorrido por Unidades Académicas</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cuatro zonas del campus con sus correspondientes misiones temáticas
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('units')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <span>Ver todas las misiones</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {course?.unidades.map((unit) => (
            <div
              key={unit.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-purple">{unit.zona}</span>
                  <span className="badge badge-green">{unit.porcentajeApi}% Completada</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {unit.nombre}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{unit.pregunta}"
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  <strong>{unit.temas.length} Temas de Investigación</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {unit.temas.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => openTopic(unit.id, t.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      {t.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logros Académicos Verificables */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Logros Académicos Verificados</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Recompensas otorgadas exclusivamente por hechos científicos comprobables (Regla 7)
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {achievements.map((ach) => (
            <div
              key={ach.id}
              onClick={ach.desbloqueado ? triggerCelebration : undefined}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                cursor: ach.desbloqueado ? 'pointer' : 'default',
                opacity: ach.desbloqueado ? 1 : 0.6,
                borderColor: ach.desbloqueado ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: ach.desbloqueado ? 'var(--c-gold-bg)' : 'var(--bg-elevated)',
                  color: ach.desbloqueado ? 'var(--c-gold)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trophy size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {ach.titulo}
                  </h4>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--c-gold)', fontFamily: 'var(--font-mono)' }}>
                    +{ach.xp} XP
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.35 }}>
                  {ach.descripcion}
                </p>
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}>
                  {ach.desbloqueado ? (
                    <span style={{ color: 'var(--c-completed)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCircle2 size={12} /> Desbloqueado
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Pendiente de verificación</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
