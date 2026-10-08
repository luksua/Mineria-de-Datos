import { AUTH_ENDPOINT, MD_BASE } from '../config';
import type { AuthState, Role } from '../types/domain';

const STORAGE_KEY_ROLE = 'md_active_role';

/**
 * Consulta si la API PHP expone algún endpoint de autenticación real.
 * Si no está disponible (brecha B1 identificada en Fase 1), lee el perfil base de
 * datos/usuario_actual.json o activa modo de simulación de roles para la interfaz.
 */
export async function checkSession(): Promise<AuthState> {
  try {
    const res = await fetch(AUTH_ENDPOINT, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.usuario) {
        return {
          status: 'authenticated',
          user: {
            id: data.usuario.id,
            nombre: data.usuario.nombre,
            rol: data.usuario.rol,
          },
        };
      }
    }
  } catch {
    // El endpoint no existe en el backend PHP actual
  }

  // Intento de leer el perfil de referencia datos/usuario_actual.json
  try {
    const userRes = await fetch(`${MD_BASE}/datos/usuario_actual.json`);
    if (userRes.ok) {
      const uData = await userRes.json();
      const storedRole = (localStorage.getItem(STORAGE_KEY_ROLE) as Role) || 'estudiante';
      return {
        status: 'authenticated',
        user: {
          id: uData.id || 'estudiante_01',
          nombre: uData.nombre || 'Investigador Académico',
          rol: storedRole,
        },
      };
    }
  } catch {
    // No accesible
  }

  const storedRole = (localStorage.getItem(STORAGE_KEY_ROLE) as Role) || 'estudiante';
  return {
    status: 'authenticated',
    user: {
      id: 'invitado',
      nombre: 'Alex Mendoza',
      rol: storedRole,
    },
  };
}

export function setActiveRole(role: Role): void {
  localStorage.setItem(STORAGE_KEY_ROLE, role);
}

export function getActiveRole(): Role {
  return (localStorage.getItem(STORAGE_KEY_ROLE) as Role) || 'estudiante';
}
