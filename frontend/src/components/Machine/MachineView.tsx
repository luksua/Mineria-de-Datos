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
  EmptyState,
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
  ExternalLink,
  Copy,
  Download,
  Check,
  Award,
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
  const [activeStation, setActiveStation] = useState<StationId>('terminal');

  // 3. Estado de ejecución en el Laboratorio R
  const [runningR, setRunningR] = useState<boolean>(false);
  const [rExecutionLog, setRExecutionLog] = useState<{ exitCode: number; salida: string } | null>(null);
  const [rMetrics, setRMetrics] = useState<MetricsFetchResult | null>(null);
  const [revealedImages, setRevealedImages] = useState<string[]>([]);

  // 4. Mecánica de acople, arrastre y feedback
  const [dockedPiece, setDockedPiece] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedTex, setCopiedTex] = useState<boolean>(false);
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

        // Preparar imágenes iniciales con su URL ya resuelta (src)
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
      text: 'Recorrido del tema reiniciado. Puedes volver a operar las 5 estaciones.',
      type: 'info',
    });
  };

  // Acción 1: Transferir consultas desde Terminal hacia Biblioteca
  const handleTransferTerminal = () => {
    if (!topicDetail || topicDetail.searches.length === 0) {
      setFeedback({
        text: 'Acople rechazado: Sin consultas registradas para este tema.',
        type: 'error',
      });
      return;
    }
    registrarEstacionOperada(selectedUnitId, selectedTopicId, 'terminal');
    refreshOperadas();
    setActiveStation('biblioteca');
    setFeedback({
      text: `¡Consultas transferidas a la Biblioteca! Ecuaciones verificadas vinculadas al acervo documental.`,
      type: 'success',
    });
  };

  // Acción 2: Transferir documentos desde Biblioteca hacia Laboratorio
  const handleTransferBiblioteca = () => {
    if (!topicDetail || topicDetail.documents.length === 0) {
      setFeedback({
        text: 'Acople rechazado: Sin documentos registrados para este tema.',
        type: 'error',
      });
      return;
    }
    registrarEstacionOperada(selectedUnitId, selectedTopicId, 'biblioteca');
    refreshOperadas();
    setActiveStation('laboratorio');
    setFeedback({
      text: `¡Acervo documental transferido al Laboratorio! Contexto bibliográfico listo para experimentación.`,
      type: 'success',
    });
  };

  // Acción 3: Validación de acople al Laboratorio
  const handleDockToLaboratorio = () => {
    if (!topicDetail) return;
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

  // Acción 3.2: Ejecución real de R en el Laboratorio
  const handleExecuteR = async () => {
    if (!topicDetail) return;
    setRunningR(true);
    setFeedback(null);

    try {
      const res = await runTopicRScript(selectedUnitId, selectedTopicId);
      setRExecutionLog({ exitCode: res.exitCode, salida: res.salida });

      if (res.ok) {
        registrarEstacionOperada(selectedUnitId, selectedTopicId, 'laboratorio');
        refreshOperadas();

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
          text: `Ejecución de R terminada con código ${res.exitCode}. Revisa la consola inferior.`,
          type: 'error',
        });
      }
    } catch (err) {
      setFeedback({
        text: `Error al ejecutar R: ${err instanceof Error ? err.message : String(err)}`,
        type: 'error',
      });
    } finally {
      setRunningR(false);
    }
  };

  // Acción 3.3: Transferir resultados de Laboratorio a Escritorio
  const handleTransferToEscritorio = () => {
    setActiveStation('escritorio');
    setFeedback({
      text: 'Resultados y gráficas transferidos al Escritorio para redacción académica.',
      type: 'info',
    });
  };

  // Acción 4: Copiar código .tex
  const handleCopyTex = () => {
    if (!topicDetail?.latex?.codigo) return;
    navigator.clipboard.writeText(topicDetail.latex.codigo);
    setCopiedTex(true);
    setTimeout(() => setCopiedTex(false), 2500);
  };

  // Acción 4.2: Descargar código .tex
  const handleDownloadTex = () => {
    if (!topicDetail?.latex?.codigo) return;
    const blob = new Blob([topicDetail.latex.codigo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = topicDetail.latex.archivo || `${selectedTopicId}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Acción 4.3: Transferir manuscrito de Escritorio a Pizarra
  const handleTransferToPizarra = () => {
    registrarEstacionOperada(selectedUnitId, selectedTopicId, 'escritorio');
    refreshOperadas();
    setActiveStation('pizarra');
    setFeedback({
      text: '¡Manuscrito LaTeX validado! Todo el material se encuentra en la Pizarra de Sustentación.',
      type: 'success',
    });
  };

  // Acción 5: Concluir sustentación en Pizarra
  const handleConcludePizarra = () => {
    registrarEstacionOperada(selectedUnitId, selectedTopicId, 'pizarra');
    refreshOperadas();
    setFeedback({
      text: '¡Sustentación completada! Todas las evidencias empíricas, métricas y fundamentación han sido validadas.',
      type: 'success',
    });
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

  // Resumen visual inicial de las 5 estaciones para ver contenido desde el inicio
  const stationPreviews = useMemo(() => {
    if (!topicDetail) return {};
    return {
      terminal: `${topicDetail.searches.length} consultas booleanas`,
      biblioteca: `${topicDetail.documents.length} documentos indexados`,
      laboratorio: topicDetail.dataset?.archivo && topicDetail.rExample?.archivo
        ? `${topicDetail.dataset.archivo} + ${topicDetail.rExample.archivo}`
        : 'Sin datos registrados',
      escritorio: topicDetail.latex?.archivo ? topicDetail.latex.archivo : 'Sin código .tex',
      pizarra: `${topicDetail.results.imagenes?.length || 0} gráficas y métricas`,
    };
  }, [topicDetail]);

  const allCompleted = operadas.length === 5;

  return (
    <div
      style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '1.75rem 1.25rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* 1. Barra de Control Superior: Selector de Pedido, Contador y Retorno */}
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
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--color-ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              Línea de Producción • Pedido Activo
            </span>
            <select
              value={`${selectedUnitId}:${selectedTopicId}`}
              onChange={(e) => {
                const [u, t] = e.target.value.split(':') as [UnitId, string];
                handleTopicChange(u, t);
              }}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--color-ink)',
                backgroundColor: 'var(--color-card-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.75rem',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '280px',
              }}
            >
              {allTopics.map((item) => (
                <option key={`${item.unitId}:${item.topicId}`} value={`${item.unitId}:${item.topicId}`}>
                  {`U${item.unitNumero}-${item.topicId.split('_')[0]}: ${item.topicNombre}`}
                </option>
              ))}
            </select>
          </div>

          {/* Contador de Estaciones Operadas */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: allCompleted ? 'var(--color-blue-soft)' : 'var(--color-card-muted)',
              border: `1px solid ${allCompleted ? 'var(--color-blue-border)' : 'var(--color-border)'}`,
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: allCompleted ? 'var(--color-blue-ink)' : 'var(--color-ink)',
            }}
          >
            <CheckCircle2 size={15} color={allCompleted ? 'var(--color-blue-ink)' : 'var(--color-terracotta)'} />
            <span>Estaciones operadas: {operadas.length} de 5</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetTopicJourney}
            title="Reiniciar estaciones operadas de este tema"
          >
            <RotateCcw size={14} /> Reiniciar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMode('direct')}
          >
            Modo Directo <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* 2. Pista Cartográfica de La Máquina: Las 5 Estaciones con Avatar Deslizante */}
      <div
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-atlas-sm)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, margin: 0, color: 'var(--color-ink)' }}>
              Línea de Montaje del Conocimiento
            </h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
              Haz clic en cualquier estación para desplazar al operador y activar su mesa de trabajo
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-mono)' }}>
            Estación actual: {activeStation.toUpperCase()}
          </span>
        </div>

        {/* Ruta de Estaciones Conectadas */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingTop: '1.25rem',
            paddingBottom: '0.75rem',
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
                    minWidth: '115px',
                    position: 'relative',
                    userSelect: 'none',
                    textAlign: 'center',
                  }}
                >
                  {/* Avatar Operador deslizante posicionado encima del nodo activo */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-24px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-terracotta)',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                        animation: 'cardEntrance 220ms ease-out',
                        zIndex: 2,
                      }}
                    >
                      Operador ▼
                    </div>
                  )}

                  {/* Pin de la estación */}
                  <div
                    className={isDone ? 'station-light-up' : undefined}
                    style={{
                      width: '48px',
                      height: '48px',
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
                      boxShadow: isActive
                        ? '0 0 0 3px var(--color-terracotta-soft)'
                        : isDone
                        ? '0 0 10px rgba(31, 58, 95, 0.2)'
                        : undefined,
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
                          width: '15px',
                          height: '15px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-blue-ink)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Nombre y subtítulo */}
                  <div style={{ marginTop: '0.45rem' }}>
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
                </div>

                {/* Conector entre estaciones con flujo dinámico */}
                {idx < ESTACIONES_LISTA.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      backgroundColor:
                        operadas.includes(est.id) && operadas.includes(ESTACIONES_LISTA[idx + 1].id)
                          ? 'var(--color-blue-ink)'
                          : 'var(--color-border)',
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

        {/* Previa de las 5 Estaciones Visible desde el Inicio */}
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--color-border-light)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.65rem',
          }}
        >
          {ESTACIONES_LISTA.map((est) => {
            const isDone = operadas.includes(est.id);
            const isCur = activeStation === est.id;
            return (
              <div
                key={`preview-${est.id}`}
                onClick={() => setActiveStation(est.id)}
                style={{
                  padding: '0.5rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCur ? 'var(--color-terracotta-soft)' : 'var(--color-card-muted)',
                  border: `1px solid ${isCur ? 'var(--color-terracotta)' : isDone ? 'var(--color-blue-border)' : 'var(--color-border-light)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isCur ? 'var(--color-terracotta-dark)' : 'var(--color-ink)' }}>
                    {est.nombre}
                  </span>
                  <span style={{ fontSize: '10px', color: isDone ? 'var(--color-blue-ink)' : 'var(--color-ink-muted)' }}>
                    {isDone ? 'Operada ✓' : 'Pendiente'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-ink-secondary)', marginTop: '0.15rem' }}>
                  {stationPreviews[est.id] || 'Cargando...'}
                </div>
              </div>
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
            <Check size={18} />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 4. Banner de Tema Completado al 100% */}
      {allCompleted && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-blue-soft)',
            border: '2px solid var(--color-blue-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            animation: 'cardEntrance 300ms ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Award size={32} color="var(--color-blue-ink)" />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-blue-ink)' }}>
                ¡Línea de Producción Completada con Éxito (5 de 5 Estaciones)!
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                Se validaron consultas, acervo bibliográfico, script de R nativo, manuscrito LaTeX y sustentación integral para "{topicDetail?.topicName}".
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setMode('direct')}>
            Ver en Modo Directo <ArrowRight size={13} />
          </Button>
        </div>
      )}

      {/* 5. Mesa de Trabajo de la Estación Activa */}
      {loadingTopic ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
          <Loader2 size={34} className="spin" style={{ color: 'var(--color-terracotta)', margin: '0 auto' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', marginTop: '0.5rem' }}>
            Cargando artefactos reales del tema...
          </p>
        </div>
      ) : activeStation === 'terminal' ? (
        /* =========================================================================
           ESTACIÓN 1: TERMINAL DE BÚSQUEDAS BOOLEANAS
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
                    backgroundColor: 'var(--color-blue-soft)',
                    color: 'var(--color-blue-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Terminal size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
                    Estación 1: Terminal de Búsquedas Booleanas
                  </h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                    Consultas indexadas del tema en solo lectura con trazabilidad académica
                  </span>
                </div>
              </div>
              <StatusBadge
                status={operadas.includes('terminal') ? 'completado' : 'pendiente'}
                label={operadas.includes('terminal') ? 'Operada' : 'Pendiente'}
              />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Barra de acción para arrastrar o transferir */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--color-card-muted)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                  Artefacto de Salida:
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', marginTop: '0.2rem' }}>
                  Ecuaciones de Búsqueda ({topicDetail?.searches.length || 0} registradas)
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleTransferTerminal}
              >
                Transferir Consulta a la Biblioteca <ArrowRight size={14} />
              </Button>
            </div>

            {/* Listado de Consultas */}
            {topicDetail && topicDetail.searches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topicDetail.searches.map((eq) => (
                  <div
                    key={eq.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--color-card)',
                      boxShadow: 'var(--shadow-atlas-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            backgroundColor: 'var(--color-blue-soft)',
                            color: 'var(--color-blue-ink)',
                            borderRadius: 'var(--radius-xs)',
                          }}
                        >
                          {eq.id}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>
                          Idioma: {eq.idioma?.toUpperCase() || 'ES'} | Nivel: {eq.nivel || 'Estándar'}
                        </span>
                      </div>

                      {eq.urlScholar && (
                        <a
                          href={eq.urlScholar}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '11px',
                            color: 'var(--color-terracotta)',
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Abrir en Scholar <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <pre
                      style={{
                        margin: 0,
                        padding: '0.6rem 0.8rem',
                        backgroundColor: 'var(--color-card-muted)',
                        borderRadius: 'var(--radius-xs)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--color-ink)',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--color-border-light)',
                      }}
                    >
                      {eq.consulta}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sin consultas registradas"
                description="No se encontraron ecuaciones booleanas asociadas a este tema en bitácora."
              />
            )}
          </div>
        </Card>
      ) : activeStation === 'biblioteca' ? (
        /* =========================================================================
           ESTACIÓN 2: BIBLIOTECA Y ACERVO DOCUMENTAL
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
                    backgroundColor: 'var(--color-blue-soft)',
                    color: 'var(--color-blue-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
                    Estación 2: Biblioteca y Acervo Documental
                  </h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                    Artículos científicos seleccionados, indexación y trazabilidad DOI
                  </span>
                </div>
              </div>
              <StatusBadge
                status={operadas.includes('biblioteca') ? 'completado' : 'pendiente'}
                label={operadas.includes('biblioteca') ? 'Operada' : 'Pendiente'}
              />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Barra de acción para transferir a Laboratorio */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--color-card-muted)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                  Artefacto de Salida:
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', marginTop: '0.2rem' }}>
                  Documentos Académicos ({topicDetail?.documents.length || 0} verificados)
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleTransferBiblioteca}
              >
                Transferir Acervo al Laboratorio <ArrowRight size={14} />
              </Button>
            </div>

            {/* Listado de Documentos */}
            {topicDetail && topicDetail.documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topicDetail.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--color-card)',
                      boxShadow: 'var(--shadow-atlas-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)' }}>
                        {doc.titulo}
                      </div>
                      {doc.pertinencia && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor:
                              doc.pertinencia === 'Alta'
                                ? 'var(--color-blue-soft)'
                                : 'var(--color-card-muted)',
                            color:
                              doc.pertinencia === 'Alta'
                                ? 'var(--color-blue-ink)'
                                : 'var(--color-ink-secondary)',
                            border: '1px solid var(--color-border-light)',
                          }}
                        >
                          Pertinencia: {doc.pertinencia}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginBottom: '0.4rem' }}>
                      <strong>Autores:</strong> {doc.autores || 'Sin autor registrado'} ({doc.anio || 's.f.'})
                      {doc.fuente && <span> • <em>{doc.fuente}</em></span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '11px' }}>
                      {doc.doi ? (
                        <a
                          href={`https://doi.org/${doc.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: 'var(--color-terracotta)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          DOI: {doc.doi} <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--color-ink-muted)' }}>Sin DOI registrado</span>
                      )}

                      {doc.urlScholar && (
                        <a
                          href={doc.urlScholar}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: 'var(--color-blue-ink)',
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Google Scholar ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sin documentos registrados"
                description="No hay artículos seleccionados registrados en la matriz bibliográfica de este tema."
              />
            )}
          </div>
        </Card>
      ) : activeStation === 'laboratorio' ? (
        /* =========================================================================
           ESTACIÓN 3: LABORATORIO EXPERIMENTAL EN R
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
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
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
                      title="Arrastra esta pieza o haz clic en Acoplar"
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

                {/* Botones de acción */}
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

                  {operadas.includes('laboratorio') && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleTransferToEscritorio}
                    >
                      Enviar al Escritorio <ArrowRight size={14} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Zona de Drop visual */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleDockToLaboratorio();
                }}
                className={isDragOver ? 'dock-zone-hover' : dockedPiece ? 'dock-snap' : undefined}
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
                      Pieza acoplada en la bahía del Laboratorio. Haz clic en "Ejecutar en R (run_r)".
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

          {/* Consola de Ejecución en Vivo de R */}
          {rExecutionLog && (
            <Card
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal size={16} color="var(--color-ink)" />
                    <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>
                      Consola de Ejecución Nativa de R (Rscript)
                    </h5>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: rExecutionLog.exitCode === 0 ? 'var(--color-blue-ink)' : 'var(--color-terracotta)',
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
                  backgroundColor: '#1E2530',
                  color: '#E6EDF3',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {rExecutionLog.salida || 'Sin salida capturada'}
              </pre>
            </Card>
          )}

          {/* Gráficas Generadas con Revelado Animado */}
          {revealedImages.length > 0 && (
            <Card
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code2 size={16} color="var(--color-terracotta)" />
                    <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>
                      Gráficas Generadas por R ({revealedImages.length})
                    </h5>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>
                    Revelado animado
                  </span>
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
                          ? `${(rMetrics.json.baseline_mayoritaria).toFixed(2)}%`
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
      ) : activeStation === 'escritorio' ? (
        /* =========================================================================
           ESTACIÓN 4: ESCRITORIO DE REDACCIÓN ACADÉMICA (LATEX)
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
                    backgroundColor: 'var(--color-blue-soft)',
                    color: 'var(--color-blue-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
                    Estación 4: Escritorio de Redacción Académica
                  </h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                    Manuscrito científico en LaTeX (.tex) con exportación y trazabilidad
                  </span>
                </div>
              </div>
              <StatusBadge
                status={operadas.includes('escritorio') ? 'completado' : 'pendiente'}
                label={operadas.includes('escritorio') ? 'Operada' : 'Pendiente'}
              />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Barra de herramientas para LaTeX */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--color-card-muted)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                  Documento Fuente LaTeX:
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', marginTop: '0.2rem' }}>
                  {topicDetail?.latex?.archivo || 'Sin archivo .tex'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyTex}
                  disabled={!topicDetail?.latex?.codigo}
                >
                  {copiedTex ? <Check size={14} color="var(--color-blue-ink)" /> : <Copy size={14} />}
                  {copiedTex ? '¡Copiado!' : 'Copiar .tex'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadTex}
                  disabled={!topicDetail?.latex?.codigo}
                >
                  <Download size={14} /> Descargar .tex
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTransferToPizarra}
                  disabled={!topicDetail?.latex?.codigo}
                >
                  Enviar a Pizarra <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            {/* Aviso ético AGENTS.md §11 */}
            <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontStyle: 'italic' }}>
              * Nota metodológica: El código se expone como texto fuente reproducible conforme a AGENTS.md §11 (sin compilación arbitraria a PDF).
            </div>

            {/* Visor de Código LaTeX */}
            {topicDetail?.latex?.codigo ? (
              <pre
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  backgroundColor: '#1E2530',
                  color: '#E6EDF3',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5,
                }}
              >
                {topicDetail.latex.codigo}
              </pre>
            ) : (
              <EmptyState
                title="Sin código LaTeX registrado"
                description="No se encontró un archivo .tex en la carpeta de este tema."
              />
            )}
          </div>
        </Card>
      ) : (
        /* =========================================================================
           ESTACIÓN 5: PIZARRA DE SUSTENTACIÓN DEL PROYECTO
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
                    backgroundColor: 'var(--color-blue-soft)',
                    color: 'var(--color-blue-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Presentation size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
                    Estación 5: Pizarra de Sustentación del Proyecto
                  </h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                    Síntesis integral de evidencias: fundamentación, gráficas y métricas experimentales
                  </span>
                </div>
              </div>
              <StatusBadge
                status={operadas.includes('pizarra') ? 'completado' : 'pendiente'}
                label={operadas.includes('pizarra') ? 'Sustentada ✓' : 'Pendiente'}
              />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Barra de acción de la Pizarra */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--color-card-muted)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                  Material de Sustentación Integrado:
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', marginTop: '0.2rem' }}>
                  {topicDetail?.topicName} (Evidencias experimentales y documentales)
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleConcludePizarra}
              >
                <CheckCircle2 size={14} /> Concluir Sustentación del Tema
              </Button>
            </div>

            {/* A. Fundamentación Temática (README.md real) */}
            <div
              style={{
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-card)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                1. Fundamentación Temática (README.md Oficial):
              </div>
              {topicDetail?.descripcionMd ? (
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-ink)',
                    lineHeight: 1.6,
                    maxHeight: '180px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {topicDetail.descripcionMd}
                </div>
              ) : (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                  Sin documentación Markdown registrada.
                </div>
              )}
            </div>

            {/* B. Gráficas de Evidencia */}
            <div
              style={{
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-card)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                2. Evidencias Gráficas ({revealedImages.length}):
              </div>

              {revealedImages.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {revealedImages.filter(Boolean).map((imgSrc, idx) => (
                    <div
                      key={imgSrc}
                      style={{
                        border: '1px solid var(--color-border-light)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={`Gráfica ${idx + 1}`}
                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'var(--radius-xs)' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                  Sin gráficas registradas. Ejecuta el script R en la estación Laboratorio.
                </div>
              )}
            </div>

            {/* C. Métricas y Validación */}
            <div
              style={{
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-card)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-ink-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                3. Métricas Numéricas y Conclusiones:
              </div>

              {rMetrics?.hasJson && rMetrics.json ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-xs)' }}>
                  <div>
                    <strong>Dataset evaluado:</strong> {rMetrics.json.dataset || 'Sin registrar'} ({rMetrics.json.dataset_origen || 'origen no catalogado'})
                  </div>
                  {rMetrics.json.baseline_mayoritaria !== null && rMetrics.json.baseline_mayoritaria !== undefined && (
                    <div>
                      <strong>Baseline clase mayoritaria:</strong> {rMetrics.json.baseline_mayoritaria}% •{' '}
                      <strong>Supera baseline:</strong> {rMetrics.json.supera_baseline ? 'Sí' : 'No'}
                    </div>
                  )}
                  {rMetrics.json.interpretacion && (
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-card-muted)', borderRadius: 'var(--radius-xs)' }}>
                      <strong>Interpretación:</strong> {rMetrics.json.interpretacion}
                    </div>
                  )}
                </div>
              ) : rMetrics?.txt ? (
                <pre
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    backgroundColor: 'var(--color-card-muted)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {rMetrics.txt}
                </pre>
              ) : (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                  Sin datos registrados de métricas.
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
