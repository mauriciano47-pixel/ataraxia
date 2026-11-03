/**
 * Ataraxia — Servicio Resiliente de Verificación de Actualizaciones Remotas (In-App Update Checker)
 * Cumple con el estándar Anti-Timeout (<8.000 ms), Zero-Crash y degradación elegante.
 * Propiedad exclusiva de Mauricio Uribe Maldonado
 */

import { SafeStorage } from '../utils/safeStorage.ts';
import { APP_VERSION, REMOTE_VERSION_URL, APK_DOWNLOAD_URL } from '../constants/appVersion.ts';

export interface UpdateManifest {
  latestVersion: string;
  versionCode?: number;
  releaseDate?: string;
  releaseTitle?: string;
  releaseHighlights?: string;
  downloadUrl?: string;
  webUrl?: string;
  isMandatory?: boolean;
}

export interface UpdateInfo {
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseTitle?: string;
  releaseHighlights?: string;
  downloadUrl: string;
  isMandatory: boolean;
  error?: string;
}

/**
 * Compara dos cadenas SemVer (MAJOR.MINOR.PATCH)
 * Retorna true si latestVersion es estrictamente mayor que currentVersion
 */
export function isVersionOutdated(currentVersion: string, latestVersion: string): boolean {
  if (!currentVersion || !latestVersion) return false;

  const clean = (v: string) =>
    v
      .trim()
      .replace(/^v/i, '')
      .split('.')
      .map((seg) => parseInt(seg, 10) || 0);

  const currParts = clean(currentVersion);
  const latestParts = clean(latestVersion);

  const maxLen = Math.max(currParts.length, latestParts.length);

  for (let i = 0; i < maxLen; i++) {
    const c = currParts[i] ?? 0;
    const l = latestParts[i] ?? 0;
    if (l > c) return true;
    if (l < c) return false;
  }

  return false;
}

/**
 * Consulta el archivo remoto version.json con AbortController y límite estricto de 3.500 ms
 */
export async function fetchRemoteVersion(
  remoteUrl: string = REMOTE_VERSION_URL,
  timeoutMs = 3500
): Promise<UpdateManifest | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, 8000));

  try {
    const response = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        Pragma: 'no-cache',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      // Intento de fallback relativo si estamos en navegador web
      if (typeof window !== 'undefined' && remoteUrl !== '/version.json') {
        const fallbackRes = await fetch('/version.json', {
          headers: { 'Cache-Control': 'no-cache' },
          signal: controller.signal,
        });
        if (fallbackRes.ok) {
          return (await fallbackRes.json()) as UpdateManifest;
        }
      }
      return null;
    }

    const data = (await response.json()) as UpdateManifest;
    return data;
  } catch (_err) {
    // Falla de red, timeout o CORS degradada silenciosamente sin romper la UI
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Evalúa si hay una actualización disponible para el cliente en ejecución
 */
export async function checkAppUpdate(
  currentVersion: string = APP_VERSION,
  options: { force?: boolean; remoteUrl?: string; timeoutMs?: number } = {}
): Promise<UpdateInfo> {
  const defaultResult: UpdateInfo = {
    isUpdateAvailable: false,
    currentVersion,
    latestVersion: currentVersion,
    downloadUrl: APK_DOWNLOAD_URL,
    isMandatory: false,
  };

  try {
    const manifest = await fetchRemoteVersion(options.remoteUrl, options.timeoutMs);
    if (!manifest || !manifest.latestVersion) {
      return defaultResult;
    }

    const latest = manifest.latestVersion;
    const isOutdated = isVersionOutdated(currentVersion, latest);

    if (!isOutdated) {
      return {
        ...defaultResult,
        latestVersion: latest,
      };
    }

    // Verificar si el usuario ya descartó esta versión previamente
    const dismissKey = `@ataraxia_dismissed_update_${latest}`;
    const wasDismissed = SafeStorage.getItem(dismissKey) === 'true';

    // Si no es obligatoria y el usuario ya la descartó (y no es chequeo forzado), no mostramos banner
    if (wasDismissed && !manifest.isMandatory && !options.force) {
      return {
        ...defaultResult,
        latestVersion: latest,
        isUpdateAvailable: false,
      };
    }

    return {
      isUpdateAvailable: true,
      currentVersion,
      latestVersion: latest,
      releaseTitle: manifest.releaseTitle || `Ataraxia v${latest}`,
      releaseHighlights: manifest.releaseHighlights,
      downloadUrl: manifest.downloadUrl || APK_DOWNLOAD_URL,
      isMandatory: Boolean(manifest.isMandatory),
    };
  } catch (err: any) {
    return {
      ...defaultResult,
      error: err?.message || 'Error en verificación de actualización',
    };
  }
}

/**
 * Guarda en almacenamiento persistente que el usuario descartó el aviso de esta versión
 */
export function dismissAppUpdate(version: string): void {
  if (!version) return;
  SafeStorage.setItem(`@ataraxia_dismissed_update_${version}`, 'true');
}

/**
 * Limpia el estado de descarte si se requiere volver a verificar
 */
export function clearDismissedUpdate(version: string): void {
  if (!version) return;
  SafeStorage.removeItem(`@ataraxia_dismissed_update_${version}`);
}
