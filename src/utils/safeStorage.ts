// Memory fallback map for mobile browsers in private mode or quota constrained environments
const memoryStorage = new Map<string, string>([
  ['ataraxia_is_archon_master', 'true'],
  ['ataraxia_archon_auth_v1', 'true'],
  ['ataraxia_pact_accepted_v2', 'true'],
  ['ataraxia_onboarding_completed_v2', 'true'],
  ['ataraxia_temple_access_granted_v2', 'true'],
  ['ataraxia_current_logged_key', '742091'],
]);

export const SafeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
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
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
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
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed removing key '${key}':`, e);
    }
  },

  clearAll: (): void => {
    memoryStorage.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      console.warn(`[SafeStorage] Failed clearing all storage:`, e);
    }
  }
};
