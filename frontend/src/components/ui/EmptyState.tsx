import React from 'react';
import { Compass } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  titulo: string;
  descripcion: string;
  icono?: React.ReactNode;
  accionTexto?: string;
  onAccion?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  titulo,
  descripcion,
  icono,
  accionTexto,
  onAccion,
  className = '',
  style,
}) => {
  return (
    <div
      className={`atlas-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: 'var(--color-card)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
        maxWidth: '560px',
        margin: '0 auto',
        ...style,
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-paper)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-ink-muted)',
          marginBottom: '1rem',
        }}
      >
        {icono || <Compass size={28} />}
      </div>

      <h3
        className="atlas-title"
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: 'var(--color-ink)',
          marginBottom: '0.4rem',
        }}
      >
        {titulo}
      </h3>

      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-ink-secondary)',
          maxWidth: '420px',
          lineHeight: 1.5,
          marginBottom: accionTexto ? '1.25rem' : 0,
        }}
      >
        {descripcion}
      </p>

      {accionTexto && onAccion && (
        <Button variant="outline" size="sm" onClick={onAccion}>
          {accionTexto}
        </Button>
      )}
    </div>
  );
};
