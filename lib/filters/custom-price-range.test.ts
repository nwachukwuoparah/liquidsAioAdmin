import { describe, expect, it } from "vitest";
import {
    CUSTOM_PRICE_RANGE_OPTION,
    encodeCustomPriceRange,
    formatCustomPriceRangeLabel,
    isCustomPriceRangeValue,
    parseCustomPriceRange,
    resolveCustomPriceRangeBounds,
} from "./custom-price-range";

describe("custom-price-range", () => {
    it("encodes and parses custom price amounts", () => {
        const encoded = encodeCustomPriceRange("100", "750");

        expect(encoded).toBe("price:100:750");
        expect(parseCustomPriceRange(encoded)).toEqual({
            minPrice: "100",
            maxPrice: "750",
        });
        expect(isCustomPriceRangeValue(encoded)).toBe(true);
        expect(isCustomPriceRangeValue(CUSTOM_PRICE_RANGE_OPTION)).toBe(true);
        expect(isCustomPriceRangeValue("$0 - $500")).toBe(false);
    });

    it("formats a readable label for encoded custom price ranges", () => {
        expect(formatCustomPriceRangeLabel("price:100:750")).toBe("$100 – $750");
    });

    it("resolves API bounds for custom price ranges", () => {
        expect(resolveCustomPriceRangeBounds("price:100:750")).toEqual({
            min_price: "100",
            max_price: "750",
        });
    });

    it("rejects inverted custom price ranges", () => {
        expect(resolveCustomPriceRangeBounds("price:750:100")).toBeNull();
    });
});
