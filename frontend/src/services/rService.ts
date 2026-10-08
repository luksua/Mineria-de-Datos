import { apiPost } from './api';
import type { ApiRunRResponse } from '../types/api';
import type { RRunResult, UnitId } from '../types/domain';
import { emptyToNull, mapImages } from './mappers';

/**
 * Ejecuta el script R real correspondiente a un tema a través de api/index.php?action=run_r
 */
export async function executeRScript(unitId: UnitId, topicId: string): Promise<RRunResult> {
  const raw = await apiPost<ApiRunRResponse>(
    { action: 'run_r' },
    { u: unitId, t: topicId }
  );

  return {
    ok: raw.status === 'success' && raw.exit_code === 0,
    exitCode: raw.exit_code,
    salida: raw.salida || '',
    results: {
      imagenes: mapImages(raw.imagenes || []),
      metricas: emptyToNull(raw.metricas),
    },
  };
}
