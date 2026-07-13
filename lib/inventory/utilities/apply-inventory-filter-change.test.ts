import { describe, expect, it } from "vitest";
import {
    applyInventoryFilterChange,
    countActiveInventoryFilters,
} from "./apply-inventory-filter-change";

describe("applyInventoryFilterChange", () => {
    it("maps category and condition labels to API values", () => {
        let params = applyInventoryFilterChange({}, "category", "Electronics");
        params = applyInventoryFilterChange(params, "condition", "New");

        expect(params).toEqual({
            category: "elt",
            condition: "new",
        });
    });

    it("maps lot status labels including Pending approval and Rejected", () => {
        expect(applyInventoryFilterChange({}, "status", "Pending approval")).toEqual({
            review_status: "pending",
        });
        expect(applyInventoryFilterChange({}, "status", "Rejected")).toEqual({
            review_status: "rejected",
        });
    });

    it("maps expanded price ranges including Over $10,000", () => {
        expect(applyInventoryFilterChange({}, "priceRange", "$0 - $500")).toEqual({
            priceRange: "$0 - $500",
            min_price: "0",
            max_price: "500",
        });
        expect(applyInventoryFilterChange({}, "priceRange", "Over $10,000")).toEqual({
            priceRange: "Over $10,000",
            min_price: "10000",
        });
    });

    it("clears fields when a default All value is selected", () => {
        const previous = {
            category: "elt",
            sellerStatus: "Verified",
            review_status: "pending",
            priceRange: "$0 - $500",
            min_price: "0",
            max_price: "500",
        };

        let params = applyInventoryFilterChange(previous, "category", "All categories");
        params = applyInventoryFilterChange(params, "sellerStatus", "All sellers");
        params = applyInventoryFilterChange(params, "status", "All status");
        params = applyInventoryFilterChange(params, "priceRange", "All prices");

        expect(params).toEqual({});
    });
});

describe("countActiveInventoryFilters", () => {
    it("counts each active filter once", () => {
        expect(
            countActiveInventoryFilters({
                review_status: "pending",
                category: "elt",
                sellerStatus: "Verified",
                min_price: "0",
                max_price: "500",
            }),
        ).toBe(4);
    });
});
