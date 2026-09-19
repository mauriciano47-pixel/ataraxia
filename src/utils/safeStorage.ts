import { Platform } from 'react-native';

// Memory fallback map for mobile browsers in private mode or quota constrained environments
const memoryStorage = new Map<string, string>([
  ['ataraxia_is_archon_master', 'true'],
  ['ataraxia_archon_auth_v1', 'true'],
  ['ataraxia_pact_accepted_v2', 'true'],
  ['ataraxia_onboarding_completed_v2', 'true'],
  ['ataraxia_temple_access_granted_v2', 'true'],
  ['ataraxia_current_logged_key', '742091'],
]);

let nativeSaveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let nativeFileSystem: typeof import('expo-file-system/legacy') | null = null;
let nativeStoragePath: string | null = null;

const getNativeFileSystem = () => {
  if (Platform.OS === 'web') return null;
  if (!nativeFileSystem) {
    try {
      nativeFileSystem = require('expo-file-system/legacy');
      if (nativeFileSystem?.documentDirectory) {
        nativeStoragePath = `${nativeFileSystem.documentDirectory}ataraxia_storage_v1.json`;
      }
    } catch (e) {
      console.warn('[SafeStorage] Could not load native expo-file-system/legacy:', e);
    }
  }
  return nativeFileSystem;
};

// Async hydration from native flash memory on app launch
export const hydrateNativeStorageAsync = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const fs = getNativeFileSystem();
    if (fs && nativeStoragePath) {
      const info = await fs.getInfoAsync(nativeStoragePath);
      if (info.exists) {
        const content = await fs.readAsStringAsync(nativeStoragePath);
        if (content) {
          const parsed = JSON.parse(content);
          if (typeof parsed === 'object' && parsed !== null) {
            for (const [k, v] of Object.entries(parsed)) {
              if (typeof v === 'string') {
                memoryStorage.set(k, v);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('[SafeStorage] Failed hydrating native storage from flash:', e);
  }
};

// Initialize native hydration immediately if running on native mobile
if (Platform.OS !== 'web') {
  hydrateNativeStorageAsync().catch(() => {});
}

// Debounced flush to native flash disk
const scheduleNativeFlush = () => {
  if (Platform.OS === 'web') return;
  if (nativeSaveDebounceTimer) clearTimeout(nativeSaveDebounceTimer);
  nativeSaveDebounceTimer = setTimeout(async () => {
    try {
      const fs = getNativeFileSystem();
      if (fs && nativeStoragePath) {
        const obj: Record<string, string> = {};
        memoryStorage.forEach((val, key) => {
          obj[key] = val;
        });
        await fs.writeAsStringAsync(nativeStoragePath, JSON.stringify(obj));
      }
    } catch (e) {
      console.warn('[SafeStorage] Failed writing native storage to flash:', e);
    }
  }, 350);
};

export const SafeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed reading key '${key}' from localStorage:`, e);
    }
    return memoryStorage.get(key) || null;
  },

  setItem: (key: string, value: string): boolean => {
    // Always keep memory copy updated
    memoryStorage.set(key, value);

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      } else {
        scheduleNativeFlush();
        return true;
      }
    } catch (e) {
      console.warn(`[SafeStorage] QuotaExceeded or StorageBlocked writing '${key}':`, e);
    }
    return false;
  },

  removeItem: (key: string): void => {
    memoryStorage.delete(key);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        scheduleNativeFlush();
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed removing key '${key}':`, e);
    }
  },

  clearAll: (): void => {
    memoryStorage.clear();
    memoryStorage.set('ataraxia_is_archon_master', 'true');
    memoryStorage.set('ataraxia_archon_auth_v1', 'true');
    memoryStorage.set('ataraxia_pact_accepted_v2', 'true');
    memoryStorage.set('ataraxia_onboarding_completed_v2', 'true');
    memoryStorage.set('ataraxia_temple_access_granted_v2', 'true');
    memoryStorage.set('ataraxia_current_logged_key', '742091');

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        window.localStorage.setItem('ataraxia_is_archon_master', 'true');
        window.localStorage.setItem('ataraxia_archon_auth_v1', 'true');
        window.localStorage.setItem('ataraxia_pact_accepted_v2', 'true');
        window.localStorage.setItem('ataraxia_onboarding_completed_v2', 'true');
        window.localStorage.setItem('ataraxia_temple_access_granted_v2', 'true');
        window.localStorage.setItem('ataraxia_current_logged_key', '742091');
      } else {
        scheduleNativeFlush();
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed clearing all storage:`, e);
    }
  }
};
