export type AdminLotReviewAction = "approve" | "reject" | "suspend";

export const INVENTORY_DECLINE_REASON_FIELD_KEY = "rejectionReason";

export const INVENTORY_SUSPEND_REASON_FIELD_KEY = "suspensionReason";

/** Value used for the free-text "Other" suspension reason. */
export const INVENTORY_SUSPEND_REASON_OTHER = "other";

/** Selectable reasons for suspending a lot listing. */
export const INVENTORY_SUSPEND_REASON_OPTIONS = [
    { value: "prohibited_item", label: "Prohibited or restricted item" },
    { value: "inaccurate_listing", label: "Misleading or inaccurate listing" },
    { value: "counterfeit_or_ip", label: "Counterfeit or IP violation" },
    { value: "pricing_abuse", label: "Pricing or fee abuse" },
    { value: "multiple_reports", label: "Multiple user reports" },
    { value: INVENTORY_SUSPEND_REASON_OTHER, label: "Other (please specify)" },
] as const;

/** Matches UUID lot ids from the inventory list API. */
const LOT_UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the lot detail path for a lot slug, or `/lots/by-id/:id` for UUIDs. */
export function getAdminLotDetailPath(lotIdentifier: string): string {
    const encodedIdentifier = encodeURIComponent(lotIdentifier);

    if (LOT_UUID_PATTERN.test(lotIdentifier)) {
        return `/lots/by-id/${encodedIdentifier}`;
    }

    return `/lots/${encodedIdentifier}`;
}

/** Returns the approve path for a lot: POST /lots/{lotId}/approve. */
export function getAdminLotApprovePath(lotIdentifier: string): string {
    return `/lots/${lotIdentifier}/approve`;
}

/** Returns the reject path for a lot: POST /lots/{lotId}/reject. */
export function getAdminLotRejectPath(lotIdentifier: string): string {
    return `/lots/${lotIdentifier}/reject`;
}

/** Returns the suspend path for a lot: POST /lots/{lotId}/suspend. */
export function getAdminLotSuspendPath(lotIdentifier: string): string {
    return `/lots/${lotIdentifier}/suspend`;
}

/**
 * Builds the human-readable reason string sent to POST /lots/{lotId}/suspend.
 * Uses the free-text note for "Other", otherwise the selected option label.
 */
export function buildAdminLotSuspendReason(reasonValue: string, note?: string): string {
    const trimmedNote = note?.trim() ?? "";

    if (reasonValue === INVENTORY_SUSPEND_REASON_OTHER) {
        return trimmedNote;
    }

    const selectedOption = INVENTORY_SUSPEND_REASON_OPTIONS.find(
        (option) => option.value === reasonValue,
    );

    return selectedOption?.label ?? reasonValue;
}
