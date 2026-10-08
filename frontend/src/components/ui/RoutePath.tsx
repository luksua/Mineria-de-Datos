import React from 'react';
import type { StatusType } from './StatusBadge';

export interface RouteNode {
  id: string;
  label: string;
  sublabel?: string;
  status: StatusType;
  icon?: React.ReactNode;
}

export interface RoutePathProps {
  nodes: RouteNode[];
  activeNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const RoutePath: React.FC<RoutePathProps> = ({
  nodes,
  activeNodeId,
  onSelectNode,
  className = '',
  style,
}) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div
      className={`atlas-route-path ${className}`}
      style={{
        width: '100%',
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem 1rem',
        boxShadow: 'var(--shadow-atlas-sm)',
        overflowX: 'auto',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          minWidth: `${nodes.length * 150}px`,
          position: 'relative',
          padding: '0 1rem',
        }}
      >
        {/* Línea conectora de fondo */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '3rem',
            right: '3rem',
            height: '2px',
            backgroundColor: 'var(--color-border-light)',
            zIndex: 1,
          }}
        />

        {nodes.map((node, index) => {
          const isSelected = activeNodeId === node.id;
          const isLast = index === nodes.length - 1;

          // Colores según estado del atlas
          const nodeColorMap: Record<StatusType, { fill: string; stroke: string; text: string; bg: string }> = {
            completado: {
              fill: 'var(--color-blue-ink)',
              stroke: 'var(--color-blue-ink)',
              text: 'var(--color-blue-ink)',
              bg: 'var(--color-blue-soft)',
            },
            actual: {
              fill: 'var(--color-terracotta)',
              stroke: 'var(--color-terracotta)',
              text: 'var(--color-terracotta-dark)',
              bg: 'var(--color-terracotta-soft)',
            },
            pendiente: {
              fill: 'var(--color-card)',
              stroke: 'var(--color-border)',
              text: 'var(--color-ink-secondary)',
              bg: 'var(--color-card-muted)',
            },
            bloqueado: {
              fill: 'var(--color-card-muted)',
              stroke: 'var(--color-border-disabled)',
              text: 'var(--color-ink-disabled)',
              bg: 'var(--color-paper)',
            },
          };

          const colors = nodeColorMap[node.status];

          return (
            <React.Fragment key={node.id}>
              {/* Nodo individual */}
              <div
                onClick={() => onSelectNode && onSelectNode(node.id)}
                role={onSelectNode ? 'button' : undefined}
                tabIndex={onSelectNode ? 0 : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  zIndex: 2,
                  cursor: onSelectNode ? 'pointer' : 'default',
                  flex: 1,
                  maxWidth: '180px',
                  userSelect: 'none',
                }}
              >
                {/* Pin / Baliza del nodo */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: colors.bg,
                    border: `2px ${node.status === 'pendiente' ? 'dashed' : 'solid'} ${colors.stroke}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.text,
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: isSelected
                      ? '0 0 0 3px var(--color-terracotta-soft), var(--shadow-atlas-sm)'
                      : 'var(--shadow-atlas-xs)',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                  }}
                >
                  {node.icon || index + 1}

                  {/* Indicador de selección activa */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-6px',
                        width: '8px',
                        height: '8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-terracotta)',
                      }}
                    />
                  )}
                </div>

                {/* Etiqueta del nodo */}
                <div style={{ marginTop: '0.65rem' }}>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: colors.text,
                      lineHeight: 1.25,
                    }}
                  >
                    {node.label}
                  </div>
                  {node.sublabel && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-ink-muted)',
                        marginTop: '0.15rem',
                      }}
                    >
                      {node.sublabel}
                    </div>
                  )}
                </div>
              </div>

              {/* Segmento de línea conectora intermedia */}
              {!isLast && (
                <div
                  style={{
                    position: 'relative',
                    flex: 1,
                    height: '2px',
                    marginTop: '22px',
                    zIndex: 1,
                    backgroundColor:
                      node.status === 'completado' ? 'var(--color-blue-ink)' : 'transparent',
                    borderTop:
                      node.status === 'completado'
                        ? 'none'
                        : '2px dashed var(--color-border)',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
