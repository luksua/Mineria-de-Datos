/**
 * Base pública de MINERIA_DATOS.
 * - Desarrollo: `/md` (proxy de Vite → Apache).
 * - Producción servida por Apache: definir VITE_MD_BASE=/api%20vehiculos%20tutoria/MINERIA_DATOS
 */
export const MD_BASE: string = (import.meta.env.VITE_MD_BASE ?? '/md').replace(/\/$/, '');

/** API PHP existente (no se modifica). */
export const API_ENDPOINT = `${MD_BASE}/api/index.php`;

/**
 * Endpoint de autenticación PROPUESTO (brecha B1). Hoy no existe: el frontend lo
 * sondea y, si responde 404, opera en modo "autenticación no disponible".
 */
export const AUTH_ENDPOINT = `${MD_BASE}/api/auth.php`;

/** Convierte una ruta relativa devuelta por la API (p. ej. `UNIDAD_1/.../x.png?t=1`) en URL servible. */
export function assetUrl(relative: string): string {
  const [path, query] = relative.split('?');
  const encoded = path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/');
  return `${MD_BASE}/${encoded}${query ? `?${query}` : ''}`;
}

/** Ancho a partir del cual se habilita el Modo Mapa. */
export const MAP_MIN_WIDTH = 1024;
