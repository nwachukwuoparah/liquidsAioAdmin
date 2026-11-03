import { describe, expect, it } from "vitest";
import {
    CUSTOM_DATE_RANGE_OPTION,
    encodeCustomDateRange,
    formatCustomDateRangeLabel,
    isCustomDateRangeValue,
    parseCustomDateRange,
    resolveCustomCalendarDateRange,
} from "./custom-date-range";

describe("custom-date-range", () => {
    it("encodes and parses custom calendar dates", () => {
        const encoded = encodeCustomDateRange("2026-01-01", "2026-01-31");

        expect(encoded).toBe("custom:2026-01-01:2026-01-31");
        expect(parseCustomDateRange(encoded)).toEqual({
            startDate: "2026-01-01",
            endDate: "2026-01-31",
        });
        expect(isCustomDateRangeValue(encoded)).toBe(true);
        expect(isCustomDateRangeValue(CUSTOM_DATE_RANGE_OPTION)).toBe(true);
        expect(isCustomDateRangeValue("Last 30 days")).toBe(false);
    });

    it("formats a readable label for encoded custom ranges", () => {
        expect(formatCustomDateRangeLabel("custom:2026-01-01:2026-01-31")).toBe(
            "Jan 1, 2026 – Jan 31, 2026",
        );
    });

    it("resolves inclusive ISO timestamps for custom calendar dates", () => {
        const range = resolveCustomCalendarDateRange("2026-01-01", "2026-01-02");

        expect(range).toBeTruthy();
        expect(range!.start).toBe(new Date(2026, 0, 1, 0, 0, 0, 0).toISOString());
        expect(range!.end).toBe(new Date(2026, 0, 2, 23, 59, 59, 999).toISOString());
    });

    it("rejects inverted custom calendar ranges", () => {
        expect(resolveCustomCalendarDateRange("2026-01-31", "2026-01-01")).toBeNull();
    });
});
