export interface MockPaymentHoldEntry {
    orderId: string;
    reason: string;
    heldAt: string;
}

// In-memory store persistent during dev server runtime
const memoryPaymentHolds = new Map<string, MockPaymentHoldEntry>();

function normalizeKey(orderId: string): string {
    return decodeURIComponent(orderId).replace(/^#/, "").trim().toLowerCase();
}

export function saveMockPaymentHold(orderId: string, reason: string): MockPaymentHoldEntry {
    const key = normalizeKey(orderId);
    const entry: MockPaymentHoldEntry = {
        orderId,
        reason,
        heldAt: new Date().toISOString(),
    };
    memoryPaymentHolds.set(key, entry);
    return entry;
}

export function getMockPaymentHold(orderId: string): MockPaymentHoldEntry | undefined {
    const key = normalizeKey(orderId);
    return memoryPaymentHolds.get(key);
}

export function deleteMockPaymentHold(orderId: string): boolean {
    const key = normalizeKey(orderId);
    return memoryPaymentHolds.delete(key);
}

export interface MockRefundEntry {
    orderId: string;
    reason: string;
    refundedAt: string;
}

const memoryRefunds = new Map<string, MockRefundEntry>();

export function saveMockRefund(orderId: string, reason: string): MockRefundEntry {
    const key = normalizeKey(orderId);
    const entry: MockRefundEntry = {
        orderId,
        reason,
        refundedAt: new Date().toISOString(),
    };
    memoryRefunds.set(key, entry);
    return entry;
}

export function getMockRefund(orderId: string): MockRefundEntry | undefined {
    const key = normalizeKey(orderId);
    return memoryRefunds.get(key);
}

export function deleteMockRefund(orderId: string): boolean {
    const key = normalizeKey(orderId);
    return memoryRefunds.delete(key);
}

export function clearAllMockPaymentHolds(): void {
    memoryPaymentHolds.clear();
    memoryRefunds.clear();
}

