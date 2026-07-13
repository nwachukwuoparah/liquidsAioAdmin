import { describe, expect, it } from "vitest";
import {
    buildPaginationPageItems,
    computeTablePaginationMeta,
    formatTablePaginationSummary,
} from "./build-table-pagination";

describe("computeTablePaginationMeta", () => {
    it("computes range and navigation flags for a middle page", () => {
        const meta = computeTablePaginationMeta({
            page: 2,
            pageSize: 10,
            totalCount: 35,
        });

        expect(meta).toEqual({
            page: 2,
            pageSize: 10,
            totalCount: 35,
            totalPages: 4,
            rangeStart: 11,
            rangeEnd: 20,
            hasPreviousPage: true,
            hasNextPage: true,
        });
    });

    it("clamps the page when it exceeds the total pages", () => {
        const meta = computeTablePaginationMeta({
            page: 9,
            pageSize: 25,
            totalCount: 30,
        });

        expect(meta.page).toBe(2);
        expect(meta.rangeStart).toBe(26);
        expect(meta.rangeEnd).toBe(30);
        expect(meta.hasNextPage).toBe(false);
    });
});

describe("buildPaginationPageItems", () => {
    it("returns all pages when there are five or fewer", () => {
        expect(buildPaginationPageItems(1, 4)).toEqual([1, 2, 3, 4]);
    });

    it("returns first, nearby, and trailing ellipsis for larger sets", () => {
        expect(buildPaginationPageItems(5, 285)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis"]);
    });
});

describe("formatTablePaginationSummary", () => {
    it("formats the showing label with thousands separators", () => {
        const summary = formatTablePaginationSummary(
            computeTablePaginationMeta({
                page: 1,
                pageSize: 20,
                totalCount: 3598,
            }),
        );

        expect(summary).toBe("Showing 1-20 of 3,598 results");
    });
});
