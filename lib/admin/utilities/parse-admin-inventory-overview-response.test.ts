import { describe, expect, it } from "vitest";
import { parseAdminInventoryOverviewResponse } from "./parse-admin-inventory-overview-response";

describe("parseAdminInventoryOverviewResponse", () => {
    it("unwraps nested stats from the lots admin overview payload", () => {
        const overview = parseAdminInventoryOverviewResponse({
            status: "success",
            data: {
                range: {
                    start: "2026-07-01T00:00:00.000Z",
                    end: "2026-07-31T23:59:59.999Z",
                },
                previousRange: {
                    start: "2026-06-01T00:00:00.000Z",
                    end: "2026-06-30T23:59:59.999Z",
                },
                stats: {
                    allListings: { count: 0, delta: -109 },
                    activeListings: { count: 0, delta: -9 },
                    declinedListings: { count: 0, delta: 0 },
                    suspendedListings: { count: 0, delta: 0 },
                },
            },
        });

        expect(overview.allListings).toEqual({ count: 0, delta: -109 });
        expect(overview.activeListings.delta).toBe(-9);
        expect(overview.start).toBe("2026-07-01T00:00:00.000Z");
        expect(overview.previousEnd).toBe("2026-06-30T23:59:59.999Z");
    });
});
