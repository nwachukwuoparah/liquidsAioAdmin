import { describe, expect, it } from "vitest";
import { buildInventoryLotsQueryParams } from "./inventory-filter-params";

describe("buildInventoryLotsQueryParams", () => {
    it("maps pending approval tab to review_status=pending", () => {
        expect(
            buildInventoryLotsQueryParams({}, { activeTab: "Pending approval" }),
        ).toMatchObject({
            review_status: "pending",
            limit: "25",
            sort: "date",
            order: "desc",
        });
    });

    it("maps reported tab to reported_lots=true", () => {
        expect(
            buildInventoryLotsQueryParams({}, { activeTab: "Reported" }),
        ).toMatchObject({
            reported_lots: "true",
        });
    });

    it("passes search and API filter params while stripping UI-only keys", () => {
        expect(
            buildInventoryLotsQueryParams(
                {
                    category: "elt",
                    condition: "new",
                    start: "2026-01-01T00:00:00.000Z",
                    end: "2026-07-08T00:00:00.000Z",
                    datePosted: "This week",
                    priceRange: "$0-$500",
                    location: "California, USA",
                    sellerStatus: "Verified",
                    status: "Pending",
                },
                { search: "iphone", activeTab: "All Lots" },
            ),
        ).toEqual({
            category: "elt",
            condition: "new",
            start: "2026-01-01T00:00:00.000Z",
            end: "2026-07-08T00:00:00.000Z",
            search: "iphone",
            limit: "25",
            sort: "date",
            order: "desc",
        });
    });

    it("tab flags override review_status from filter params on reported tab", () => {
        expect(
            buildInventoryLotsQueryParams(
                { review_status: "pending" },
                { activeTab: "Reported" },
            ),
        ).toMatchObject({
            review_status: "pending",
            reported_lots: "true",
        });
    });
});
