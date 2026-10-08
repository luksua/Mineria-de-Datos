# Guía de Estilo: Sistema de Diseño Atlas Claro
**Proyecto:** Ruta del Conocimiento: La Máquina de Minería  
**Referencia:** `AGENTS.md` (§8, §9 y §11)  
**Versión:** 1.0 (Fase 3)

---

## 1. Filosofía Visual

La plataforma adopta una estética **sobria, rigurosa y académica** denominada **Atlas Claro**. 

- **Concepto clave:** La interfaz emula las láminas de un atlas científico o mapa cartográfico de investigación, donde el conocimiento fluye a lo largo de estaciones y caminos de nodos.
- **Sin estridencias:** Quedan estrictamente prohibidos los fondos oscuros estilo "gaming", efectos de neón, degradados sintéticos intensos y componentes recargados.
- **Propósito:** Cada color, contorno y animación tiene una función semántica inequívoca.

---

## 2. Paleta Canónica de Colores

Todas las variables están centralizadas en `frontend/src/index.css`.

| Variable CSS | Valor Hex | Función Semántica |
|---|---|---|
| `--color-paper` | `#F6F1E7` | **Fondo base** (pliego de papel / atlas). |
| `--color-card` | `#FFFDF8` | **Superficie de tarjetas**, paneles y módulos. |
| `--color-card-muted` | `#F8F4EB` | Fondo alternado sutil para tablas y contenedores secundarios. |
| `--color-border` | `#D9CFBB` | **Contornos principales** tipo mapa grabado. |
| `--color-border-light` | `#EFE8D8` | Rejillas secundarias y líneas divisorias. |
| `--color-ink` | `#1F2A3C` | **Tinta profunda:** texto principal, títulos y datos clave (contraste > 11:1). |
| `--color-ink-secondary` | `#5C5648` | Texto explicativo, notas al pie y metadatos (contraste > 7:1). |
| `--color-ink-muted` | `#8C8474` | Metadatos terciarios legibles (contraste >= 4.5:1, nivel AA). |
| `--color-ink-disabled` | `#B8AE98` | Elementos inactivos o bloqueados (con línea punteada). |
| `--color-blue-ink` | `#1F3A5F` | **Tinta azul:** estado completado, verificado, biblioteca académica y énfasis. |
| `--color-blue-soft` | `#E4EAF2` | Fondo suave para insignias completadas y selección documental. |
| `--color-terracotta` | `#B5532F` | **Acento terracota único:** tema actual, estación en operación y botones primarios. |
| `--color-terracotta-soft` | `#FBF0EB` | Fondo suave para elementos en curso o destacados. |
| `--color-danger-ink` | `#992323` | Mensajes de error sobrios. |
| `--color-danger-bg` | `#FDF2F2` | Fondo de tarjetas de error. |

### Regla Semántica de Estados:
1. **Azul tinta (`#1F3A5F` sobre `#E4EAF2`):** Completado, verificado, entregable listo.
2. **Terracota (`#B5532F` sobre `#FBF0EB`):** Estado actual, acción primaria, foco activo.
3. **Gris cálido punteado (`#5C5648` sobre `#F4EFE6`):** Pendiente de ejecución.
4. **Gris apagado (`#8C8474` / `#B8AE98` sobre `#EFECE4`):** Bloqueado (requiere paso previo).

---

## 3. Tipografía

El texto de contenido respeta estrictamente el tamaño mínimo de **14 px (0.875 rem)** para garantizar legibilidad continua.

| Familia | Variable | Uso Recomendado |
|---|---|---|
| **Sans-Serif** | `--font-sans` (`Inter`, system fallbacks) | Interfaz general, navegación, formularios y botones. |
| **Serif** | `--font-serif` (`Cinzel`, `EB Garamond`, `Georgia`) | Títulos de unidad, encabezados de atlas y sellos institucionales. |
| **Monospace** | `--font-mono` (`JetBrains Mono`, `Consolas`) | Fórmulas, consultas booleanas, scripts R, DOI y métricas numéricas. |

### Escala Modular:
- Micro-etiquetas (tags): `0.75rem` (12px)
- Texto secundario y tablas: `0.875rem` (14px)
- Texto estándar de lectura: `1rem` (16px)
- Subtítulos: `1.125rem` (18px)
- Encabezados de tarjeta: `1.25rem` (20px)
- Títulos de sección: `1.5rem` (24px)
- Títulos de unidad: `1.875rem` (30px)

---

## 4. Radios, Sombras y Movimiento

- **Radios:**
  - Botones y entradas: `4px` (`--radius-sm`, sobrio, sin redondeos infantiles).
  - Tarjetas y módulos: `8px` (`--radius-md`).
  - Insignias / Pills: `9999px` (`--radius-full`).
- **Sombras:**
  - Extremadamente sutiles, simulando relieve de papel: `--shadow-atlas-xs` y `--shadow-atlas-sm`.
- **Movimiento con propósito:**
  - Transiciones rápidas: `150ms cubic-bezier(0.4, 0, 0.2, 1)`.
  - Transiciones normales: `240ms cubic-bezier(0.4, 0, 0.2, 1)`.
  - Respeto absoluto a `@media (prefers-reduced-motion: reduce)` desactivando animaciones automáticamente.

---

## 5. Componentes Base (`src/components/ui/`)

| Componente | Archivo | Descripción y Estados |
|---|---|---|
| **Button** | `Button.tsx` | Variantes: `primary`, `secondary`, `outline`, `ghost`, `danger`. Tamaños `sm`, `md`, `lg`. Estados: normal, hover, disabled, loading con spinner. |
| **Card** | `Card.tsx` | Contenedor sobrio. Variantes: `default`, `muted`, `dashed`. Slots para `header`, `body` y `footer`. |
| **MissionCard** | `MissionCard.tsx` | Modela cada tema como misión académica: encargo (objetivo), pistas (docs y clips), evidencias (R, gráficas, LaTeX) y barra de progreso. Estados: `completada`, `en_curso`, `pendiente`. |
| **StationCard** | `StationCard.tsx` | Modela las 5 estaciones de La Máquina: muestra objeto entrante, transformación real, objeto saliente y botón de acción. Estados: `activa`, `disponible`, `bloqueada`. |
| **ObjectPiece** | `ObjectPiece.tsx` | Pieza visual de la línea de producción (consulta booleana, documentos, dataset/script R, gráficas/métricas, LaTeX, presentación). Estados: `listo`, `en_proceso`, `pendiente`, `bloqueado`. |
| **ProgressBar** | `ProgressBar.tsx` | Barra de progreso con variantes `blue` y `terracotta`, soporte ARIA y porcentaje exacto. |
| **StatusBadge** | `StatusBadge.tsx` | Insignia con los 4 estados canónicos: `completado`, `actual`, `pendiente` y `bloqueado`. |
| **Banner** | `Banner.tsx` | Banner estático sobrio con fondo de pergamino, borde tipo mapa y métricas reales. |
| **DataTable** | `DataTable.tsx` | Tabla estilo atlas con campo de búsqueda y filtrado en vivo, contador de resultados, estados vacíos y paginación. |
| **Tabs** | `Tabs.tsx` | Selector de pestañas accesible con variantes `underline` (terracota) y `pill` (azul tinta). |
| **EmptyState** | `EmptyState.tsx` | Estado vacío sobrio con icono, título, descripción y acción opcional. |
| **Loading** | `Loading.tsx` | Indicador de carga con spinner SVG suave y mensaje de contexto. |
| **ErrorMessage** | `ErrorMessage.tsx` | Mensaje de error sobrio sobre fondo `#FDF2F2`, detalle técnico y botón de reintento. |
| **RoutePath** | `RoutePath.tsx` | Camino cartográfico continuo con nodos, balizas de estación y conexiones sólidas/punteadas. |

---

## 6. Cabecera Unificada (Navbar)

La cabecera se reestructuró a **una sola fila limpia**:
1. **Marca:** Logo con brújula y texto "La Máquina de Minería · Ruta del Conocimiento".
2. **Selector de Modo:** Botones toggle sobrios entre **La Máquina** (modo interactivo) y **Directo** (modo clásico sin animaciones).
3. **Navegación:** Enlaces directos a Dashboard, Unidades, Buscador, Lab LaTeX, Manual y **UI Kit**.
4. **Remoción de datos ficticios:** Se eliminaron el selector de rol simulado y los badges de XP/nivel ficticios (se repondrán en la Fase 7 basándose en el recorrido real del usuario).

---

## 7. Catálogo Interactivo en Vivo

Para inspeccionar y probar todos los componentes en todos sus estados, navegar a la ruta:
`/ui-kit` (disponible también desde la barra superior).
