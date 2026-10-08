import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateMissionStatus, type MissionStatus } from '../../lib/progress/progressLogic';
import type { UnitId } from '../../types/domain';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertTriangle,
  Award,
  HelpCircle,
} from 'lucide-react';

export const UnitsExplorer: React.FC = () => {
  const { course, openTopic } = useApp();
  const [selectedUnitId, setSelectedUnitId] = useState<UnitId>('UNIDAD_1');

  if (!course) return null;

  const currentUnit = course.unidades.find((u) => u.id === selectedUnitId) || course.unidades[0];
  const unitIndex = course.unidades.findIndex((u) => u.id === selectedUnitId);
  const previousUnit = unitIndex > 0 ? course.unidades[unitIndex - 1] : undefined;

  const getStatusBadge = (status: MissionStatus) => {
    switch (status) {
      case 'dominado':
        return (
          <span className="badge badge-gold">
            <Award size={12} /> Dominado
          </span>
        );
      case 'completado':
        return (
          <span className="badge badge-green">
            <CheckCircle2 size={12} /> Completado
          </span>
        );
      case 'en_progreso':
        return <span className="badge badge-blue">En progreso</span>;
      case 'bloqueado':
        return (
          <span className="badge badge-gray" style={{ color: 'var(--c-gold)' }}>
            <Lock size={12} /> Bloqueo Suave
          </span>
        );
      case 'disponible':
      default:
        return <span className="badge badge-gray">Disponible</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Selector de Unidades */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {course.unidades.map((unit) => {
          const isSelected = unit.id === selectedUnitId;
          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => setSelectedUnitId(unit.id)}
              className="card"
              style={{
                padding: '1rem 1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                borderColor: isSelected ? 'var(--c-interactive)' : 'var(--border-subtle)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span className="badge badge-purple">{unit.zona}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-completed)' }}>
                  {unit.porcentajeApi}%
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {unit.nombre}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {unit.temas.length} Misiones Temáticas
              </p>
            </button>
          );
        })}
      </div>

      {/* Objetivo de la Zona / Pregunta Problema (Sección 5) */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '4px solid var(--c-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <HelpCircle size={18} style={{ color: 'var(--c-secondary)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-secondary)' }}>
            Objetivo de la Zona · {currentUnit.zona}
          </span>
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.45 }}>
          "{currentUnit.pregunta}"
        </h3>
      </div>

      {/* Grid de Tarjetas de Misión (Sección 6) */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
          Misiones Temáticas de la {currentUnit.nombre}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {currentUnit.temas.map((topic) => {
            const mission = calculateMissionStatus(topic, currentUnit, previousUnit, true);

            return (
              <div
                key={topic.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-gray" style={{ fontFamily: 'var(--font-mono)' }}>
                      {topic.id}
                    </span>
                    {getStatusBadge(mission.estado)}
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {topic.nombre}
                  </h4>

                  {/* Advertencia de Bloqueo Suave */}
                  {mission.esBloqueoSuave && mission.advertenciaBloqueo && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--c-gold-bg)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        fontSize: '0.75rem',
                        color: 'var(--c-gold)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                      }}
                    >
                      <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{mission.advertenciaBloqueo}</span>
                    </div>
                  )}

                  {/* Barra de progreso de 8 actividades */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      <span>Matriz de Actividades</span>
                      <span>
                        {mission.actividadesCompletadas} de {mission.totalActividades} ({mission.porcentaje}%)
                      </span>
                    </div>
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
                          width: `${mission.porcentaje}%`,
                          height: '100%',
                          backgroundColor: mission.porcentaje === 100 ? 'var(--c-completed)' : 'var(--c-interactive)',
                          transition: 'width 0.25s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de acción */}
                <button
                  type="button"
                  onClick={() => openTopic(currentUnit.id, topic.id)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <span>Continuar misión</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
