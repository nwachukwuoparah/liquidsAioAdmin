import { describe, expect, it } from "vitest";
import {
    buildComplianceReviewQueryParams,
    resolveComplianceDateRange,
} from "./compliance-filter-params";

describe("resolveComplianceDateRange", () => {
    it("returns an empty range for all-time selections", () => {
        expect(resolveComplianceDateRange("All time")).toEqual({});
    });

    it("returns start and end timestamps for a preset range", () => {
        const range = resolveComplianceDateRange("Last 30 days");

        expect(range.start).toBeTruthy();
        expect(range.end).toBeTruthy();
        expect(new Date(range.start!).getTime()).toBeLessThanOrEqual(new Date(range.end!).getTime());
    });

    it("returns start and end timestamps for an encoded custom range", () => {
        const range = resolveComplianceDateRange("custom:2026-01-01:2026-01-31");

        expect(range.start).toBe(new Date(2026, 0, 1, 0, 0, 0, 0).toISOString());
        expect(range.end).toBe(new Date(2026, 0, 31, 23, 59, 59, 999).toISOString());
    });

    it("returns start and end timestamps for last 7 and last 90 day presets", () => {
        const lastSevenDays = resolveComplianceDateRange("Last 7 days");
        const lastNinetyDays = resolveComplianceDateRange("Last 90 days");

        expect(lastSevenDays.start).toBeTruthy();
        expect(lastSevenDays.end).toBeTruthy();
        expect(lastNinetyDays.start).toBeTruthy();
        expect(lastNinetyDays.end).toBeTruthy();
        expect(new Date(lastSevenDays.start!).getTime()).toBeGreaterThan(
            new Date(lastNinetyDays.start!).getTime(),
        );
    });
});

describe("buildComplianceReviewQueryParams", () => {
    it("strips UI-only dateRange before calling the API", () => {
        expect(
            buildComplianceReviewQueryParams({
                dateRange: "Last 30 days",
                account_type: "buyer",
                start: "2026-01-01T00:00:00.000Z",
                end: "2026-07-08T00:00:00.000Z",
            }),
        ).toEqual({
            account_type: "buyer",
            start: "2026-01-01T00:00:00.000Z",
            end: "2026-07-08T00:00:00.000Z",
        });
    });
});
