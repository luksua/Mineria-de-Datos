import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getTopicDetail } from '../../services/topicService';
import { runTopicRScript } from '../../services/runService';
import { fetchTopicMetrics, type MetricsFetchResult } from '../../services/metricsService';
import {
  ESTACIONES_LISTA,
  type StationId,
  getEstacionesOperadas,
  registrarEstacionOperada,
  reiniciarRecorridoTema,
} from '../../services/recorridoService';
import {
  Card,
  Button,
  StatusBadge,
  ProgressBar,
  type StatusType,
} from '../ui';
import {
  Terminal,
  BookOpen,
  FlaskConical,
  FileText,
  Presentation,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Database,
  Code2,
  LineChart,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import type { TopicDetail, UnitId } from '../../types/domain';

export const MachineView: React.FC = () => {
  const { course, setMode } = useApp();

  // 1. Selector de tema ("Pedido"): un tema a la vez
  const [selectedUnitId, setSelectedUnitId] = useState<UnitId>('UNIDAD_1');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('01_MINERIA_DE_DATOS');
  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [loadingTopic, setLoadingTopic] = useState<boolean>(true);

  // 2. Estación activa y Avatar Operador
  const [activeStation, setActiveStation] = useState<StationId>('laboratorio');

  // 3. Estado de ejecución en el Laboratorio R
  const [runningR, setRunningR] = useState<boolean>(false);
  const [rExecutionLog, setRExecutionLog] = useState<{ exitCode: number; salida: string } | null>(null);
  const [rMetrics, setRMetrics] = useState<MetricsFetchResult | null>(null);
  const [revealedImages, setRevealedImages] = useState<string[]>([]);

  // 4. Mecánica de acople y mensajes de feedback
  const [dockedPiece, setDockedPiece] = useState<'dataset_script' | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 5. Estaciones operadas en localStorage
  const [operadas, setOperadas] = useState<StationId[]>([]);

  // Actualizar estaciones operadas desde el servicio
  const refreshOperadas = () => {
    const list = getEstacionesOperadas(selectedUnitId, selectedTopicId);
    setOperadas(list);
  };

  // Cargar datos del tema seleccionado
  useEffect(() => {
    let mounted = true;
    setLoadingTopic(true);
    setDockedPiece(null);
    setFeedback(null);
    setRExecutionLog(null);
    setRMetrics(null);
    setRevealedImages([]);

    getTopicDetail(selectedUnitId, selectedTopicId, { refresh: true })
      .then((detail) => {
        if (!mounted) return;
        setTopicDetail(detail);
        refreshOperadas();

        // Si ya existen imágenes y métricas previas en el tema, prepararlas
        if (detail.results.imagenes && detail.results.imagenes.length > 0) {
          setRevealedImages(detail.results.imagenes.map((img) => img.src));
        }
        if (detail.results.metricas) {
          fetchTopicMetrics(selectedUnitId, selectedTopicId, detail.results.metricas).then((m) => {
            if (mounted) setRMetrics(m);
          });
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setFeedback({
          text: `Error al cargar datos del tema: ${err instanceof Error ? err.message : String(err)}`,
          type: 'error',
        });
      })
      .finally(() => {
        if (mounted) setLoadingTopic(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedUnitId, selectedTopicId]);

  // Manejar cambio de tema en selector
  const handleTopicChange = (uId: UnitId, tId: string) => {
    setSelectedUnitId(uId);
    setSelectedTopicId(tId);
  };

  // Reiniciar recorrido de este tema
  const handleResetTopicJourney = () => {
    reiniciarRecorridoTema(selectedUnitId, selectedTopicId);
    setDockedPiece(null);
    setRExecutionLog(null);
    refreshOperadas();
    setFeedback({
      text: 'Recorrido del tema reiniciado. Puedes volver a operar las estaciones.',
      type: 'info',
    });
  };

  // Validación de acople al Laboratorio
  const handleDockToLaboratorio = () => {
    if (!topicDetail) return;

    // Validación rigurosa con los datos reales de topic_data
    const hasCsv = Boolean(topicDetail.dataset?.archivo);
    const hasScript = Boolean(topicDetail.rExample?.archivo);

    if (!hasCsv || !hasScript) {
      setFeedback({
        text: 'Acople rechazado: Faltan artefactos físicos en el tema. Sin datos registrados.',
        type: 'error',
      });
      return;
    }

    setDockedPiece('dataset_script');
    setFeedback({
      text: `¡Pieza acoplada con éxito! Dataset (${topicDetail.dataset.archivo}) y Script R (${topicDetail.rExample?.archivo}) listos en el Laboratorio.`,
      type: 'success',
    });
  };

  // Ejecución real de R en el Laboratorio
  const handleExecuteR = async () => {
    if (!topicDetail) return;
    setRunningR(true);
    setFeedback(null);

    try {
      const res = await runTopicRScript(selectedUnitId, selectedTopicId);
      setRExecutionLog({ exitCode: res.exitCode, salida: res.salida });

      if (res.ok) {
        // Registrar éxito en localStorage detrás del servicio
        registrarEstacionOperada(selectedUnitId, selectedTopicId, 'laboratorio');
        refreshOperadas();

        // Revelado animado de imágenes y consulta de métricas JSON/TXT
        if (res.results.imagenes && res.results.imagenes.length > 0) {
          setRevealedImages(res.results.imagenes.map((img) => img.src));
        }

        const metricsData = await fetchTopicMetrics(selectedUnitId, selectedTopicId, res.results.metricas);
        setRMetrics(metricsData);

        setFeedback({
          text: `Laboratorio completado con éxito (código de salida ${res.exitCode}). Gráficas y métricas actualizadas.`,
          type: 'success',
        });
      } else {
        setFeedback({
          text: `Ejecución de R terminada con advertencias o error (código de salida ${res.exitCode}). Revisa la consola inferior.`,
          type: 'error',
        });
      }
    } catch (err) {
      setFeedback({
        text: `Error de red al ejecutar R: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
    } finally {
      setRunningR(false);
    }
  };

  // Mapeo de iconos por estación
  const stationIconMap: Record<StationId, React.ReactNode> = {
    terminal: <Terminal size={18} />,
    biblioteca: <BookOpen size={18} />,
    laboratorio: <FlaskConical size={18} />,
    escritorio: <FileText size={18} />,
    pizarra: <Presentation size={18} />,
  };

  // Lista plana de los 24 temas para el selector
  const allTopics = useMemo(() => {
    if (!course) return [];
    return course.unidades.flatMap((u) =>
      u.temas.map((t) => ({
        unitId: u.id,
        unitNumero: u.numero,
        unitNombre: u.nombre,
        topicId: t.id,
        topicNombre: t.nombre,
      }))
    );
  }, [course]);

  return (
    <div
      style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '1.75rem 1.25rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* 1. Barra de Control Superior: Selector de Pedido (Tema), Contador y Retorno */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-atlas-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-terracotta)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Línea de Producción • Pedido Activo
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <select
                value={`${selectedUnitId}:::${selectedTopicId}`}
                onChange={(e) => {
                  const [u, t] = e.target.value.split(':::');
                  handleTopicChange(u as UnitId, t);
                }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  backgroundColor: 'var(--color-card-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  maxWidth: '380px',
                }}
              >
                {course?.unidades.map((u) => (
                  <optgroup key={u.id} label={`Unidad ${u.numero}: ${u.nombre}`}>
                    {u.temas.map((t) => (
                      <option key={t.id} value={`${u.id}:::${t.id}`}>
                        {u.id.replace('UNIDAD_', 'U')}-{t.id.slice(0, 2)}: {t.nombre}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Contador de Estaciones Operadas */}
          <div
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-blue-soft)',
              border: '1px solid var(--color-blue-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={16} color="var(--color-blue-ink)" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-blue-ink)' }}>
              Estaciones operadas: {operadas.length} de 5
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetTopicJourney}
            title="Reiniciar estaciones operadas en este tema"
          >
            <RotateCcw size={14} /> Reiniciar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode('direct')}
          >
            Modo Directo <ArrowRight size={13} />
          </Button>
        </div>
      </div>

      {/* 2. Camino de Atlas con las 5 Estaciones y Avatar Operador Deslizante */}
      <div
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem 1.25rem 1.25rem',
          boxShadow: 'var(--shadow-atlas-sm)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="atlas-title" style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
            Línea de Montaje del Conocimiento
          </h3>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
            Haz clic en una estación para deslizar el avatar y operarla.
          </span>
        </div>

        {/* Ruta de Estaciones */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {ESTACIONES_LISTA.map((est, idx) => {
            const isActive = activeStation === est.id;
            const isDone = operadas.includes(est.id);

            return (
              <React.Fragment key={est.id}>
                {/* Estación Individual */}
                <div
                  onClick={() => setActiveStation(est.id)}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: '110px',
                    position: 'relative',
                    userSelect: 'none',
                    textAlign: 'center',
                  }}
                >
                  {/* Pin de la estación */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive
                        ? 'var(--color-terracotta-soft)'
                        : isDone
                        ? 'var(--color-blue-soft)'
                        : 'var(--color-card-muted)',
                      border: `2px solid ${
                        isActive
                          ? 'var(--color-terracotta)'
                          : isDone
                          ? 'var(--color-blue-ink)'
                          : 'var(--color-border)'
                      }`,
                      color: isActive
                        ? 'var(--color-terracotta-dark)'
                        : isDone
                        ? 'var(--color-blue-ink)'
                        : 'var(--color-ink-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? '0 0 0 3px var(--color-terracotta-soft)' : undefined,
                      transition: 'all 240ms var(--motion-ease-out)',
                      position: 'relative',
                    }}
                  >
                    {stationIconMap[est.id]}

                    {/* Check de operada */}
                    {isDone && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '14px',
                          height: '14px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-blue-ink)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Nombre y subtítulo */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: isActive ? 800 : 700,
                        color: isActive
                          ? 'var(--color-terracotta)'
                          : isDone
                          ? 'var(--color-blue-ink)'
                          : 'var(--color-ink)',
                      }}
                    >
                      {est.nombre}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-ink-muted)' }}>
                      {est.subtitulo}
                    </div>
                  </div>

                  {/* Avatar Operador deslizante */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-18px',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-terracotta)',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        animation: 'cardEntrance 200ms ease-out',
                      }}
                    >
                      Operador
                    </div>
                  )}
                </div>

                {/* Conector entre estaciones */}
                {idx < ESTACIONES_LISTA.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      backgroundColor:
                        operadas.includes(est.id) && operadas.includes(ESTACIONES_LISTA[idx + 1].id)
                          ? 'var(--color-blue-ink)'
                          : 'var(--color-border)',
                      borderTop: '1px dashed transparent',
                      minWidth: '24px',
                      marginBottom: '1.25rem',
                      transition: 'background-color 300ms ease',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Mensaje de retroalimentación de acople */}
      {feedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor:
              feedback.type === 'success'
                ? 'var(--color-blue-soft)'
                : feedback.type === 'error'
                ? 'var(--color-danger-bg)'
                : 'var(--color-card-muted)',
            border: `1px solid ${
              feedback.type === 'success'
                ? 'var(--color-blue-border)'
                : feedback.type === 'error'
                ? 'var(--color-danger-border)'
                : 'var(--color-border)'
            }`,
            color:
              feedback.type === 'success'
                ? 'var(--color-blue-ink)'
                : feedback.type === 'error'
                ? 'var(--color-danger-ink)'
                : 'var(--color-ink)',
            animation: 'cardEntrance 200ms ease-out',
          }}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : feedback.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <Info size={18} />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 4. Panel Operativo de la Estación Activa */}
      {loadingTopic ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loader2 size={32} className="spin" style={{ color: 'var(--color-terracotta)', margin: '0 auto' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', marginTop: '0.5rem' }}>
            Cargando artefactos reales del tema...
          </p>
        </div>
      ) : activeStation === 'laboratorio' ? (
        /* =========================================================================
           ESTACIÓN 3: LABORATORIO (COMPLETA EN 6A)
           ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-terracotta-soft)',
                      color: 'var(--color-terracotta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0, color: 'var(--color-ink)' }}>
                      Estación 3: Laboratorio Experimental en R
                    </h4>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                      Ejecución de modelos con Rscript nativo, consolas y métricas reales
                    </span>
                  </div>
                </div>
                <StatusBadge
                  status={operadas.includes('laboratorio') ? 'completado' : dockedPiece ? 'actual' : 'pendiente'}
                  label={operadas.includes('laboratorio') ? 'Operada con éxito' : dockedPiece ? 'Pieza acoplada' : 'Pendiente de acople'}
                />
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Zona de Piezas Disponibles y Acople */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-card-muted)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                    Artefacto Requerido para el Laboratorio:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', 'dataset_script');
                      }}
                      style={{
                        padding: '0.5rem 0.85rem',
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'grab',
                        boxShadow: 'var(--shadow-atlas-xs)',
                      }}
                      title="Arrastra esta pieza o usa el botón Enviar"
                    >
                      <Code2 size={16} color="var(--color-terracotta)" />
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink)' }}>
                          Dataset ({topicDetail?.dataset?.archivo || 'Sin CSV'}) + Script ({topicDetail?.rExample?.archivo || 'Sin .R'})
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-ink-muted)' }}>
                          {topicDetail?.dataset?.preview ? `${topicDetail.dataset.preview.length} filas previas` : 'Sin datos'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón alternativo accesible sin arrastre */}
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  {!dockedPiece ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDockToLaboratorio}
                    >
                      <ArrowRight size={14} /> Acoplar al Laboratorio
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={runningR}
                      onClick={handleExecuteR}
                    >
                      <Play size={14} /> Ejecutar en R (run_r)
                    </Button>
                  )}
                </div>
              </div>

              {/* Zona de Drop visual */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDockToLaboratorio();
                }}
                style={{
                  border: `2px dashed ${dockedPiece ? 'var(--color-blue-ink)' : 'var(--color-border)'}`,
                  backgroundColor: dockedPiece ? 'var(--color-blue-soft)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem',
                  textAlign: 'center',
                  transition: 'all 240ms ease',
                }}
              >
                {dockedPiece ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} color="var(--color-blue-ink)" />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-blue-ink)' }}>
                      Pieza acoplada en la bahía del Laboratorio. Haz clic en "Ejecutar en R".
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                    Arrastra aquí la pieza "Dataset + Script R" o haz clic en "Acoplar al Laboratorio"
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Consola en Vivo con exit_code y stdout/stderr real */}
          {rExecutionLog && (
            <Card
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal size={16} color="var(--color-ink)" />
                    <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>
                      Consola de Salida del Script (Rscript)
                    </h5>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: rExecutionLog.exitCode === 0 ? 'var(--color-blue-soft)' : 'var(--color-danger-bg)',
                      color: rExecutionLog.exitCode === 0 ? 'var(--color-blue-ink)' : 'var(--color-danger-ink)',
                      fontWeight: 700,
                    }}
                  >
                    exit_code: {rExecutionLog.exitCode}
                  </span>
                </div>
              }
            >
              <pre
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  backgroundColor: 'var(--color-card-muted)',
                  border: '1px solid var(--color-border-light)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                {rExecutionLog.salida || 'Sin salida por consola registrada.'}
              </pre>
            </Card>
          )}

          {/* Revelado Animado de Gráficas PNG */}
          {revealedImages.length > 0 && (
            <Card
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LineChart size={16} color="var(--color-terracotta)" />
                  <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>
                    Gráficas Generadas por el Laboratorio ({revealedImages.length})
                  </h5>
                </div>
              }
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {revealedImages.filter(Boolean).map((imgSrc, idx) => {
                  const fileName = imgSrc
                    ? (imgSrc.split('/').pop()?.split('?')[0] || `figura_${idx + 1}.png`)
                    : `figura_${idx + 1}.png`;
                  return (
                    <div
                      key={imgSrc}
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.65rem',
                        backgroundColor: 'var(--color-card)',
                        boxShadow: 'var(--shadow-atlas-xs)',
                        animation: 'cardEntrance 280ms var(--motion-ease-out) both',
                        animationDelay: `${idx * 120}ms`,
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.4rem' }}>
                        {fileName}
                      </div>
                      <img
                        src={imgSrc}
                        alt={fileName}
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border-light)',
                          display: 'block',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Métricas Reales: metricas.json enriquecido o .txt fidedigno */}
          {rMetrics && (
            <Card
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={16} color="var(--color-blue-ink)" />
                    <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>
                      Métricas de Rendimiento {rMetrics.hasJson ? '(metricas.json)' : '(.txt)'}
                    </h5>
                  </div>
                  {rMetrics.json?.fecha_ejecucion && (
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                      Ejecutado: {rMetrics.json.fecha_ejecucion}
                    </span>
                  )}
                </div>
              }
            >
              {rMetrics.hasJson && rMetrics.json ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Resumen de tarea y baseline */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ padding: '0.65rem', backgroundColor: 'var(--color-card-muted)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>Tipo de Tarea</div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink)' }}>
                        {rMetrics.json.tipo_tarea || 'Sin registrar'}
                      </div>
                    </div>
                    <div style={{ padding: '0.65rem', backgroundColor: 'var(--color-card-muted)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>Baseline Mayoritaria</div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink)' }}>
                        {rMetrics.json.baseline_mayoritaria !== null && rMetrics.json.baseline_mayoritaria !== undefined
                          ? `${(rMetrics.json.baseline_mayoritaria * 100).toFixed(2)}%`
                          : 'No aplica'}
                      </div>
                    </div>
                    <div style={{ padding: '0.65rem', backgroundColor: 'var(--color-card-muted)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>Supera Baseline</div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: rMetrics.json.supera_baseline ? 'var(--color-blue-ink)' : 'var(--color-terracotta)' }}>
                        {rMetrics.json.supera_baseline === null || rMetrics.json.supera_baseline === undefined
                          ? 'No evaluado'
                          : rMetrics.json.supera_baseline
                          ? 'Sí'
                          : 'No'}
                      </div>
                    </div>
                  </div>

                  {/* Modelos comparados */}
                  {rMetrics.json.modelos && rMetrics.json.modelos.length > 0 && (
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-muted)', marginBottom: '0.4rem' }}>
                        Modelos Evaluados en Prueba:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
                        {rMetrics.json.modelos.map((mod: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--color-border-light)',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-card)',
                            }}
                          >
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink)' }}>
                              {mod.modelo || `Modelo ${idx + 1}`}
                            </div>
                            {mod.accuracy !== undefined && (
                              <div style={{ fontSize: '11px', color: 'var(--color-ink-secondary)' }}>
                                Exactitud: {(mod.accuracy * 100).toFixed(2)}%
                              </div>
                            )}
                            {mod.sensibilidad !== undefined && (
                              <div style={{ fontSize: '11px', color: 'var(--color-ink-secondary)' }}>
                                Sensibilidad: {(mod.sensibilidad * 100).toFixed(2)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interpretación literal */}
                  {rMetrics.json.interpretacion && (
                    <div style={{ padding: '0.65rem', backgroundColor: 'var(--color-card-muted)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                      <strong>Interpretación literal:</strong> {rMetrics.json.interpretacion}
                    </div>
                  )}
                </div>
              ) : (
                <pre
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    backgroundColor: 'var(--color-card-muted)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {rMetrics.displayOutput}
                </pre>
              )}
            </Card>
          )}
        </div>
      ) : (
        /* =========================================================================
           OTRAS ESTACIONES (Terminal, Biblioteca, Escritorio, Pizarra)
           Conectadas y listas para la Entrega 6B
           ========================================================================= */
        <Card
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-card-muted)',
                    color: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stationIconMap[activeStation]}
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
                    Estación: {ESTACIONES_LISTA.find((e) => e.id === activeStation)?.nombre}
                  </h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                    {ESTACIONES_LISTA.find((e) => e.id === activeStation)?.subtitulo}
                  </span>
                </div>
              </div>
              <StatusBadge
                status={operadas.includes(activeStation) ? 'completado' : 'pendiente'}
                label={operadas.includes(activeStation) ? 'Operada' : 'Entrega 6B'}
              />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', margin: 0 }}>
              {ESTACIONES_LISTA.find((e) => e.id === activeStation)?.queOcurre}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--color-card-muted)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div>
                <strong>Entrada:</strong> {ESTACIONES_LISTA.find((e) => e.id === activeStation)?.objetoEntrada}
              </div>
              <div>
                <strong>Salida:</strong> {ESTACIONES_LISTA.find((e) => e.id === activeStation)?.objetoSalida}
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-ink-muted)', fontSize: 'var(--text-xs)' }}>
              Esta estación está conectada a la línea de montaje. Sus acciones detalladas de arrastre e interacción interactiva se activarán en la <strong>Entrega 6B</strong>.
              Puedes operar ahora la estación central de <strong>Laboratorio</strong>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveStation('laboratorio')}
              >
                Ir a la estación Laboratorio <ArrowRight size={13} />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
