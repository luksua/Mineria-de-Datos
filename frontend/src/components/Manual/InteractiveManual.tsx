import React, { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';

interface ManualSection {
  id: string;
  titulo: string;
  categoria: string;
  contenido: React.ReactNode;
}

export const InteractiveManual: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('sec_flujo');

  const manualSections: ManualSection[] = [
    {
      id: 'sec_flujo',
      titulo: '1. Flujo Curricular Jerárquico',
      categoria: 'Metodología',
      contenido: (
        <div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            El sistema se rige rigurosamente por el principio metodológico:
          </p>
          <div className="code-block" style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            UNIDAD ➔ TEMA ➔ BÚSQUEDA ➔ DOCUMENTO ➔ DATASET ➔ EJEMPLO R ➔ RESULTADO ➔ LATEX ➔ AVANCE
          </div>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Cada estudiante avanza completando las 8 actividades verificables por tema. No se otorgan puntos por tiempo en pantalla, sino exclusivamente por evidencias científicas y experimentales registradas.
          </p>
        </div>
      ),
    },
    {
      id: 'sec_kdd_crisp',
      titulo: '2. KDD vs. CRISP-DM',
      categoria: 'Metodología',
      contenido: (
        <div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            En la Unidad 1 se formalizan los dos estándares internacionales:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-dim)' }}>
            <li><strong>KDD (Fayyad et al., 1996):</strong> Selección ➔ Preprocesamiento ➔ Transformación ➔ Minería de Datos ➔ Interpretación/Evaluación.</li>
            <li><strong>CRISP-DM (Wirth & Hipp, 2000):</strong> Comprensión del Negocio ➔ Comprensión de los Datos ➔ Preparación ➔ Modelado ➔ Evaluación ➔ Despliegue.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sec_r_lab',
      titulo: '3. Ejecución de Scripts en R v4.4.1',
      categoria: 'Laboratorio',
      contenido: (
        <div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Todos los scripts de R son totalmente reproducibles con semillas fijas (<code>set.seed</code>). La API PHP ejecuta los scripts de forma nativa invocando:
          </p>
          <div className="code-block" style={{ marginBottom: '1rem' }}>
            Rscript.exe "UNIDAD_X/TEMA_Y/ejemplos_R/script.R"
          </div>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Los resultados generan automáticamente gráficos diagnósticos en formato <code>.png</code> y reportes numéricos en <code>.txt</code> dentro de la carpeta <code>resultados/</code> del tema.
          </p>
        </div>
      ),
    },
    {
      id: 'sec_scholar_prisma',
      titulo: '4. Ecuaciones Booleanas y PRISMA',
      categoria: 'Investigación',
      contenido: (
        <div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Las ecuaciones siguen estándares bibliométricos con operadores booleanos estrictos (<code>AND</code>, <code>OR</code>, <code>NOT / -</code>), limitando la inclusión de literatura no científica comercial y priorizando fuentes indexadas en Scopus, IEEE y Springer.
          </p>
          <div className="code-block" style={{ marginBottom: '1rem' }}>
            ("data mining" OR "minería de datos") AND (clustering OR "association rules") -commercial
          </div>
        </div>
      ),
    },
    {
      id: 'sec_rpg_guide',
      titulo: '5. Modo Mapa RPG vs. Modo Directo',
      categoria: 'Investigación',
      contenido: (
        <div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            El RPG es una capa visual y motivacional para recorrer el campus universitario:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-dim)' }}>
            <li><strong>Biblioteca (Unidad 1):</strong> Búsquedas y literatura seminal.</li>
            <li><strong>Taller de Teoría (Unidad 2):</strong> Algoritmos, árboles y redes.</li>
            <li><strong>Laboratorio (Unidad 3):</strong> Datasets reales y modelos aplicados.</li>
            <li><strong>Sala de Sustentación (Unidad 4):</strong> Proyecto integrador.</li>
          </ul>
        </div>
      ),
    },
  ];

  const filteredSections = manualSections.filter(
    (s) =>
      s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeContent = manualSections.find((s) => s.id === selectedId) || manualSections[0];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <BookOpen size={20} style={{ color: 'var(--c-interactive-hover)' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Manual Metodológico Interactivo</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Guía integral de investigación científica, laboratorio en R, estándares bibliométricos y arquitectura.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Navegación Lateral */}
        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el manual..."
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                backgroundColor: 'var(--bg-deep)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {filteredSections.map((sec) => {
              const isSelected = sec.id === selectedId;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedId(sec.id)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected ? 'var(--c-interactive-bg)' : 'transparent',
                    color: isSelected ? 'var(--c-interactive-hover)' : 'var(--text-dim)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sec.titulo}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido Seleccionado */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="badge badge-purple">{activeContent.categoria}</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {activeContent.titulo}
            </h3>
          </div>
          <div style={{ marginTop: '1rem' }}>
            {activeContent.contenido}
          </div>
        </div>
      </div>
    </div>
  );
};
