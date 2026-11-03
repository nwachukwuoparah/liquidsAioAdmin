import { describe, expect, it } from "vitest";
import {
    applyUserFilterChange,
    buildUserListQueryParams,
    countActiveUserFilters,
    mapAccountStatusParam,
    mapComplianceStatusParam,
} from "./user-filter-params";
import { encodeCustomDateRange } from "@/lib/filters/custom-date-range";

describe("user-filter-params", () => {
    describe("mapComplianceStatusParam", () => {
        it("returns undefined for empty or all statuses", () => {
            expect(mapComplianceStatusParam("")).toBeUndefined();
            expect(mapComplianceStatusParam("All statuses")).toBeUndefined();
            expect(mapComplianceStatusParam("All")).toBeUndefined();
            expect(mapComplianceStatusParam(null)).toBeUndefined();
        });

        it("normalizes status values into snake_case lowercase", () => {
            expect(mapComplianceStatusParam("Pending")).toBe("pending");
            expect(mapComplianceStatusParam("In Review")).toBe("in_review");
            expect(mapComplianceStatusParam("Needs info")).toBe("needs_info");
            expect(mapComplianceStatusParam("Approved")).toBe("approved");
            expect(mapComplianceStatusParam("Rejected")).toBe("rejected");
        });
    });

    describe("mapAccountStatusParam", () => {
        it("returns undefined for default options", () => {
            expect(mapAccountStatusParam("")).toBeUndefined();
            expect(mapAccountStatusParam("All")).toBeUndefined();
            expect(mapAccountStatusParam(null)).toBeUndefined();
        });

        it("normalizes account status to lowercase", () => {
            expect(mapAccountStatusParam("Active")).toBe("active");
            expect(mapAccountStatusParam("Suspended")).toBe("suspended");
        });
    });

    describe("applyUserFilterChange", () => {
        it("applies complianceStatus and clears it on default", () => {
            const next = applyUserFilterChange({}, "complianceStatus", "In Review");
            expect(next.complianceStatus).toBe("In Review");

            const reset = applyUserFilterChange(next, "complianceStatus", "All statuses");
            expect(reset.complianceStatus).toBeUndefined();
        });

        it("applies accountStatus and clears it on default", () => {
            const next = applyUserFilterChange({}, "accountStatus", "Suspended");
            expect(next.accountStatus).toBe("Suspended");

            const reset = applyUserFilterChange(next, "accountStatus", "All");
            expect(reset.accountStatus).toBeUndefined();
        });

        it("resolves joinedDate preset to start and end timestamps", () => {
            const next = applyUserFilterChange({}, "joinedDate", "Last 7 days");
            expect(next.joinedDate).toBe("Last 7 days");
            expect(next.start).toBeDefined();
            expect(next.end).toBeDefined();

            const reset = applyUserFilterChange(next, "joinedDate", "All time");
            expect(reset.joinedDate).toBeUndefined();
            expect(reset.start).toBeUndefined();
            expect(reset.end).toBeUndefined();
        });

        it("resolves custom date range to ISO start and end", () => {
            const customValue = encodeCustomDateRange("2026-01-01", "2026-01-31");
            const next = applyUserFilterChange({}, "joinedDate", customValue);
            expect(next.start).toBeDefined();
            expect(next.end).toBeDefined();
        });

        it("discards unsupported filters such as location", () => {
            const next = applyUserFilterChange({ location: "New York" }, "location", "London");
            expect(next.location).toBeUndefined();
        });
    });

    describe("buildUserListQueryParams", () => {
        it("builds query params for buyer tab with search query q", () => {
            const params = buildUserListQueryParams(
                {},
                {
                    activeSegmentTab: "buyer",
                    searchQuery: "mag",
                },
            );

            expect(params.accountType).toBe("buyer");
            expect(params.reported_users).toBeUndefined();
            expect(params.q).toBe("mag");
            expect(params.search).toBe("mag");
        });

        it("builds query params for seller tab", () => {
            const params = buildUserListQueryParams(
                {},
                {
                    activeSegmentTab: "seller",
                },
            );

            expect(params.accountType).toBe("seller");
            expect(params.reported_users).toBeUndefined();
        });

        it("builds query params for reported tab using reported_users=true without accountType", () => {
            const params = buildUserListQueryParams(
                {},
                {
                    activeSegmentTab: "reported",
                },
            );

            expect(params.reported_users).toBe("true");
            expect(params.accountType).toBeUndefined();
        });

        it("maps complianceStatus and accountStatus filters to server parameters", () => {
            const params = buildUserListQueryParams(
                {
                    complianceStatus: "In Review",
                    accountStatus: "Active",
                    start: "2026-01-01T00:00:00.000Z",
                    end: "2026-01-31T23:59:59.000Z",
                    location: "Lagos", // unsupported
                },
                {
                    activeSegmentTab: "buyer",
                },
            );

            expect(params.complianceStatus).toBe("in_review");
            expect(params.accountStatus).toBe("active");
            expect(params.start).toBe("2026-01-01T00:00:00.000Z");
            expect(params.end).toBe("2026-01-31T23:59:59.000Z");
            expect(params.location).toBeUndefined();
        });
    });

    describe("countActiveUserFilters", () => {
        it("counts active filters accurately and ignores server-unsupported filters", () => {
            expect(countActiveUserFilters({})).toBe(0);
            expect(
                countActiveUserFilters({
                    complianceStatus: "In Review",
                }),
            ).toBe(1);
            expect(
                countActiveUserFilters({
                    complianceStatus: "In Review",
                    accountStatus: "Active",
                }),
            ).toBe(2);
            expect(
                countActiveUserFilters({
                    complianceStatus: "In Review",
                    accountStatus: "Active",
                    joinedDate: "Last 30 days",
                    location: "Paris", // not counted!
                }),
            ).toBe(3);
        });
    });
});
