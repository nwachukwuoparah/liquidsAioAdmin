import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
});

const localStorageStore = new Map<string, string>();

const localStorageMock: Storage = {
    get length() {
        return localStorageStore.size;
    },
    clear() {
        localStorageStore.clear();
    },
    getItem(key: string) {
        return localStorageStore.get(key) ?? null;
    },
    key(index: number) {
        return Array.from(localStorageStore.keys())[index] ?? null;
    },
    removeItem(key: string) {
        localStorageStore.delete(key);
    },
    setItem(key: string, value: string) {
        localStorageStore.set(key, value);
    },
};

Object.defineProperty(window, "localStorage", {
    writable: true,
    configurable: true,
    value: localStorageMock,
});

const sessionStorageStore = new Map<string, string>();

const sessionStorageMock: Storage = {
    get length() {
        return sessionStorageStore.size;
    },
    clear() {
        sessionStorageStore.clear();
    },
    getItem(key: string) {
        return sessionStorageStore.get(key) ?? null;
    },
    key(index: number) {
        return Array.from(sessionStorageStore.keys())[index] ?? null;
    },
    removeItem(key: string) {
        sessionStorageStore.delete(key);
    },
    setItem(key: string, value: string) {
        sessionStorageStore.set(key, value);
    },
};

Object.defineProperty(window, "sessionStorage", {
    writable: true,
    configurable: true,
    value: sessionStorageMock,
});

beforeEach(() => {
    localStorageStore.clear();
    sessionStorageStore.clear();
});
