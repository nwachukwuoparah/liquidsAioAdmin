function canUseLocalStorage(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Reads a value from localStorage.
 * @param storageKey - Key to read.
 */
export function getLocalStorageValue(storageKey: string): string | null {
    if (!canUseLocalStorage()) {
        return null;
    }

    try {
        return window.localStorage.getItem(storageKey);
    } catch {
        return null;
    }
}

/**
 * Writes a value to localStorage.
 * @param storageKey - Key to write.
 * @param storageValue - Value to persist.
 */
export function setLocalStorageValue(storageKey: string, storageValue: string): void {
    if (!canUseLocalStorage()) {
        return;
    }

    try {
        window.localStorage.setItem(storageKey, storageValue);
    } catch {
        return;
    }
}

/**
 * Removes a value from localStorage.
 * @param storageKey - Key to delete.
 */
export function deleteLocalStorageValue(storageKey: string): void {
    if (!canUseLocalStorage()) {
        return;
    }

    try {
        window.localStorage.removeItem(storageKey);
    } catch {
        return;
    }
}
