import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getAllCanonicalSearches,
  filterSearches,
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
  getSearchHistory,
  recordSearchHistory,
  type SavedSearch,
} from '../../services/searchService';
import type { SearchEquation, UnitId } from '../../types/domain';
import {
  Search,
  ExternalLink,
  Bookmark,
  History,
  Trash2,
  BookOpen,
} from 'lucide-react';

export const SearchEngine: React.FC = () => {
  const { course } = useApp();
  const [query, setQuery] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<UnitId | 'ALL'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string | 'ALL'>('ALL');
  const [onlyOriginalU1, setOnlyOriginalU1] = useState<boolean>(false);

  const [allSearches, setAllSearches] = useState<SearchEquation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedList, setSavedList] = useState<SavedSearch[]>([]);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'saved' | 'history'>('catalog');

  useEffect(() => {
    let isMounted = true;
    getAllCanonicalSearches().then((searches) => {
      if (isMounted) {
        setAllSearches(searches);
        setLoading(false);
      }
    });
    setSavedList(getSavedSearches());
    setHistoryList(getSearchHistory());
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      recordSearchHistory(query);
      setHistoryList(getSearchHistory());
    }
  };

  const handleSaveSearch = (s: SearchEquation) => {
    saveSearch({
      query: s.consulta,
      unitId: s.unitId,
      topicId: s.topicId,
      notes: `${s.id}: ${s.objetivo || ''}`,
    });
    setSavedList(getSavedSearches());
  };

  const handleDeleteSaved = (id: string) => {
    deleteSavedSearch(id);
    setSavedList(getSavedSearches());
  };

  const insertOperator = (op: string) => {
    setQuery((prev) => (prev ? `${prev} ${op} ` : `${op} `));
  };

  const filtered = filterSearches(allSearches, query, {
    unitId: selectedUnit,
    topicId: selectedTopic,
    onlyOriginalU1,
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Search size={20} style={{ color: 'var(--c-interactive-hover)' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Motor de Búsqueda Bibliográfica</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Exploración booleana de las 100 ecuaciones canónicas originales y del catálogo general de 24 temas.
        </p>
      </div>

      {/* Barra de Búsqueda y Operadores Booleanos */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface)' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ej: "data mining" AND (clustering OR "association rules") -commercial'
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                backgroundColor: 'var(--bg-deep)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Search size={16} />
            <span>Buscar</span>
          </button>
        </form>

        {/* Asistentes Booleanos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
            Operadores:
          </span>
          {['AND', 'OR', 'NOT', '" "', 'survey', 'overview', '-commercial'].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => insertOperator(op)}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
            >
              {op}
            </button>
          ))}
          {query && (
            <a
              href={`https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', marginLeft: 'auto' }}
            >
              <ExternalLink size={12} />
              Probar en Scholar
            </a>
          )}
        </div>
      </div>

      {/* Filtros y Pestañas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <BookOpen size={14} />
            Catálogo Canónico ({filtered.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`btn ${activeTab === 'saved' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <Bookmark size={14} />
            Búsquedas Guardadas ({savedList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <History size={14} />
            Historial ({historyList.length})
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={onlyOriginalU1}
                onChange={(e) => setOnlyOriginalU1(e.target.checked)}
              />
              <span>Solo 100 originales (U1)</span>
            </label>

            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value as UnitId | 'ALL')}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
              }}
            >
              <option value="ALL">Todas las Unidades</option>
              {course?.unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>

            {selectedUnit !== 'ALL' && (
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.8rem',
                }}
              >
                <option value="ALL">Todos los Temas</option>
                {course?.unidades
                  .find((u) => u.id === selectedUnit)
                  ?.temas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando ecuaciones desde la API...
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron ecuaciones para la consulta indicada.
            </div>
          ) : (
            filtered.map((s) => (
              <div key={s.id} className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-blue">{s.id}</span>
                    <span className="badge badge-gray">{s.unitId}</span>
                    {s.nivel && <span className="badge badge-gray">{s.nivel}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSaveSearch(s)}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Guardar en marcadores"
                    >
                      <Bookmark size={12} />
                      Guardar
                    </button>
                    {s.urlScholar && (
                      <a
                        href={s.urlScholar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <ExternalLink size={12} />
                        Scholar
                      </a>
                    )}
                  </div>
                </div>

                <div className="code-block" style={{ marginBottom: '0.5rem' }}>
                  {s.consulta}
                </div>

                {s.objetivo && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    <strong>Objetivo:</strong> {s.objetivo}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Búsquedas Guardadas */}
      {activeTab === 'saved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {savedList.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Sin búsquedas guardadas. Puedes guardar ecuaciones desde el catálogo.
            </div>
          ) : (
            savedList.map((item) => (
              <div key={item.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-gold">Guardada</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(item.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--c-danger)' }}
                  >
                    <Trash2 size={12} />
                    Eliminar
                  </button>
                </div>
                <div className="code-block">{item.query}</div>
                {item.notes && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {item.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Historial de Consultas */}
      {activeTab === 'history' && (
        <div className="card" style={{ padding: '1rem' }}>
          {historyList.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay historial registrado aún.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {historyList.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                  }}
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      setActiveTab('catalog');
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                  >
                    Usar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
