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
