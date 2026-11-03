/** Label shown in date-range filter menus for picking an explicit interval. */
export const CUSTOM_DATE_RANGE_OPTION = "Custom range";
export const CUSTOM_DATE_OPTION = "Custom date";

/** Returns whether a label is a custom date option ("Custom range" or "Custom date"). */
export function isCustomDateRangeOption(value?: string | null): boolean {
    return value === CUSTOM_DATE_RANGE_OPTION || value === CUSTOM_DATE_OPTION;
}

const CUSTOM_DATE_RANGE_PREFIX = "custom:";

/** Returns whether a filter value represents an explicit custom date range. */
export function isCustomDateRangeValue(value: string): boolean {
    return isCustomDateRangeOption(value) || value.startsWith(CUSTOM_DATE_RANGE_PREFIX);
}

/** Encodes calendar dates into a filter value the API layer can parse. */
export function encodeCustomDateRange(startDate: string, endDate: string): string {
    return `${CUSTOM_DATE_RANGE_PREFIX}${startDate}:${endDate}`;
}

/** Parses an encoded custom date-range filter value into calendar dates. */
export function parseCustomDateRange(
    value: string,
): { startDate: string; endDate: string } | null {
    if (!value.startsWith(CUSTOM_DATE_RANGE_PREFIX)) {
        return null;
    }

    const [startDate, endDate] = value.slice(CUSTOM_DATE_RANGE_PREFIX.length).split(":");

    if (!startDate || !endDate) {
        return null;
    }

    return { startDate, endDate };
}

/** Formats an encoded custom range for the filter pill trigger. */
export function formatCustomDateRangeLabel(value: string): string {
    const parsed = parseCustomDateRange(value);

    if (!parsed) {
        return value === CUSTOM_DATE_OPTION ? CUSTOM_DATE_OPTION : CUSTOM_DATE_RANGE_OPTION;
    }

    const start = formatCalendarDateLabel(parsed.startDate);
    const end = formatCalendarDateLabel(parsed.endDate);

    if (!start || !end) {
        return value === CUSTOM_DATE_OPTION ? CUSTOM_DATE_OPTION : CUSTOM_DATE_RANGE_OPTION;
    }

    return `${start} – ${end}`;
}

function formatCalendarDateLabel(calendarDate: string): string | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(calendarDate);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** Converts calendar dates into inclusive ISO start/end timestamps. */
export function resolveCustomCalendarDateRange(
    startDate: string,
    endDate: string,
): { start: string; end: string } | null {
    const start = parseCalendarDateStart(startDate);
    const end = parseCalendarDateEnd(endDate);

    if (!start || !end || start.getTime() > end.getTime()) {
        return null;
    }

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

function parseCalendarDateStart(calendarDate: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(calendarDate);

    if (!match) {
        return null;
    }

    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
}

function parseCalendarDateEnd(calendarDate: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(calendarDate);

    if (!match) {
        return null;
    }

    const date = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        23,
        59,
        59,
        999,
    );
    return Number.isNaN(date.getTime()) ? null : date;
}
