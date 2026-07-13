function canUseSessionStorage(): boolean {
    return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

/**
 * Reads a value from sessionStorage.
 * @param storageKey - Key to read.
 */
export function getSessionStorageValue(storageKey: string): string | null {
    if (!canUseSessionStorage()) {
        return null;
    }

    try {
        return window.sessionStorage.getItem(storageKey);
    } catch {
        return null;
    }
}

/**
 * Writes a value to sessionStorage.
 * @param storageKey - Key to write.
 * @param storageValue - Value to persist.
 */
export function setSessionStorageValue(storageKey: string, storageValue: string): void {
    if (!canUseSessionStorage()) {
        return;
    }

    try {
        window.sessionStorage.setItem(storageKey, storageValue);
    } catch {
        return;
    }
}

/**
 * Removes a value from sessionStorage.
 * @param storageKey - Key to delete.
 */
export function deleteSessionStorageValue(storageKey: string): void {
    if (!canUseSessionStorage()) {
        return;
    }

    try {
        window.sessionStorage.removeItem(storageKey);
    } catch {
        return;
    }
}
