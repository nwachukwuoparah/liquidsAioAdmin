import { describe, expect, it } from "vitest";
import {
    CATEGORY_GMV_DATA,
    formatGmv,
    formatPercent,
    getTrendDataForRange,
} from "./chart-data";

describe("chart-data", () => {
    it("formats GMV values in thousands", () => {
        expect(formatGmv(0)).toBe("$0");
        expect(formatGmv(55000)).toBe("$55k");
        expect(formatGmv(140000)).toBe("$140k");
    });

    it("returns expected point counts for each trend range", () => {
        expect(getTrendDataForRange("30D")).toHaveLength(10);
        expect(getTrendDataForRange("7D")).toHaveLength(7);
        expect(getTrendDataForRange("1D")).toHaveLength(1);
    });

    it("slices trend data from the end for shorter ranges", () => {
        const full = getTrendDataForRange("30D");
        const week = getTrendDataForRange("7D");
        const day = getTrendDataForRange("1D");

        expect(week[0]).toEqual(full[full.length - 7]);
        expect(day[0]).toEqual(full[full.length - 1]);
    });

    it("formats percentages with one decimal place", () => {
        expect(formatPercent(20)).toBe("20.0%");
        expect(formatPercent(15.5)).toBe("15.5%");
    });

    it("keeps category percentages summing to 100", () => {
        const total = CATEGORY_GMV_DATA.reduce((sum, item) => sum + item.value, 0);
        expect(total).toBe(100);
    });
});
