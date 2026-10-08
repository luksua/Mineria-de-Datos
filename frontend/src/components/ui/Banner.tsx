import React from 'react';
import { Compass } from 'lucide-react';

export interface BannerProps {
  titulo: string;
  subtitulo?: string;
  icono?: React.ReactNode;
  metricaPrincipal?: {
    valor: string | number;
    etiqueta: string;
  };
  metricaSecundaria?: {
    valor: string | number;
    etiqueta: string;
  };
  variant?: 'atlas' | 'editorial' | 'terracotta';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Banner: React.FC<BannerProps> = ({
  titulo,
  subtitulo,
  icono,
  metricaPrincipal,
  metricaSecundaria,
  variant = 'atlas',
  children,
  className = '',
  style,
}) => {
  const bgMap = {
    atlas: 'var(--color-card)',
    editorial: 'var(--color-card-muted)',
    terracotta: 'var(--color-terracotta-soft)',
  };

  const accentBorder = {
    atlas: 'var(--color-blue-ink)',
    editorial: 'var(--color-border)',
    terracotta: 'var(--color-terracotta)',
  };

  return (
    <div
      className={`atlas-banner atlas-banner-${variant} ${className}`}
      style={{
        backgroundColor: bgMap[variant],
        border: '1px solid var(--color-border)',
        borderLeft: `5px solid ${accentBorder[variant]}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.75rem',
        boxShadow: 'var(--shadow-atlas-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      {/* Contenido principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-paper)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: variant === 'terracotta' ? 'var(--color-terracotta)' : 'var(--color-blue-ink)',
            flexShrink: 0,
          }}
        >
          {icono || <Compass size={24} />}
        </div>
        <div>
          <h2
            className="atlas-title"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {titulo}
          </h2>
          {subtitulo && (
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-ink-secondary)',
                margin: '0.2rem 0 0',
              }}
            >
              {subtitulo}
            </p>
          )}
          {children && <div style={{ marginTop: '0.5rem' }}>{children}</div>}
        </div>
      </div>

      {/* Métricas destacadas */}
      {(metricaPrincipal || metricaSecundaria) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
          {metricaPrincipal && (
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-terracotta)',
                  lineHeight: 1.1,
                }}
              >
                {metricaPrincipal.valor}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                {metricaPrincipal.etiqueta}
              </div>
            </div>
          )}

          {metricaSecundaria && (
            <div
              style={{
                textAlign: 'right',
                borderLeft: '1px solid var(--color-border-light)',
                paddingLeft: '1.5rem',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-blue-ink)',
                  lineHeight: 1.1,
                }}
              >
                {metricaSecundaria.valor}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                {metricaSecundaria.etiqueta}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
