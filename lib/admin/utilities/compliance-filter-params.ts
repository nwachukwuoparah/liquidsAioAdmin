/** Maps compliance date-range presets to API `start` / `end` ISO timestamps. */
export function resolveComplianceDateRange(dateRange: string): { start?: string; end?: string } {
    const now = new Date();
    const end = now.toISOString();

    switch (dateRange) {
        case "Today": {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            return { start: start.toISOString(), end };
        }
        case "This week": {
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            start.setHours(0, 0, 0, 0);
            return { start: start.toISOString(), end };
        }
        case "This month": {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start: start.toISOString(), end };
        }
        case "Last 30 days": {
            const start = new Date(now);
            start.setDate(now.getDate() - 30);
            return { start: start.toISOString(), end };
        }
        default:
            return {};
    }
}

/** Removes UI-only keys before sending compliance list query params to the API. */
export function buildComplianceReviewQueryParams(
    filterParams: Record<string, string>,
): Record<string, string> {
    const { dateRange: _dateRange, ...apiParams } = filterParams;
    return apiParams;
}
