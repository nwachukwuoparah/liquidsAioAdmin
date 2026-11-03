import { describe, expect, it } from "vitest";
import {
    formatInventoryOverviewDelta,
    getInventoryOverviewDefaultRange,
    getInventoryOverviewRange,
} from "./admin-inventory-overview.constant";

describe("getInventoryOverviewDefaultRange", () => {
    it("returns ISO timestamps for the current month", () => {
        const range = getInventoryOverviewDefaultRange();
        const start = new Date(range.start);
        const end = new Date(range.end);

        expect(start.getDate()).toBe(1);
        expect(end.getMonth()).toBe(start.getMonth());
    });
});

describe("getInventoryOverviewRange", () => {
    it("returns ISO range for Today", () => {
        const range = getInventoryOverviewRange("Today");
        const start = new Date(range.start);
        const end = new Date(range.end);
        expect(start.getTime()).toBeLessThan(end.getTime());
    });

    it("returns ISO range for This week", () => {
        const range = getInventoryOverviewRange("This week");
        const start = new Date(range.start);
        const end = new Date(range.end);
        expect(start.getTime()).toBeLessThan(end.getTime());
    });

    it("returns ISO range for This month", () => {
        const range = getInventoryOverviewRange("This month");
        const start = new Date(range.start);
        const end = new Date(range.end);
        expect(start.getDate()).toBe(1);
        expect(end.getMonth()).toBe(start.getMonth());
    });

    it("returns ISO range for This year", () => {
        const range = getInventoryOverviewRange("This year");
        const start = new Date(range.start);
        const end = new Date(range.end);
        expect(start.getMonth()).toBe(0);
        expect(start.getDate()).toBe(1);
        expect(end.getMonth()).toBe(11);
        expect(end.getDate()).toBe(31);
    });

    it("returns ISO range for All time", () => {
        const range = getInventoryOverviewRange("All time");
        const start = new Date(range.start);
        const end = new Date(range.end);
        expect(start.getFullYear()).toBe(2020);
        expect(start.getTime()).toBeLessThan(end.getTime());
    });
});

describe("formatInventoryOverviewDelta", () => {
    it("prefixes positive deltas with a plus sign for growth metrics", () => {
        expect(formatInventoryOverviewDelta(12, "positiveGood")).toEqual({
            text: "+12",
            className: "text-[#117346]",
            trendDirection: "up",
        });
    });

    it("colors negative deltas red for growth metrics", () => {
        expect(formatInventoryOverviewDelta(-3, "positiveGood")).toEqual({
            text: "-3",
            className: "text-[#CC2929]",
            trendDirection: "down",
        });
    });

    it("uses alert red for declined and suspended deltas", () => {
        expect(formatInventoryOverviewDelta(-6, "alert")).toEqual({
            text: "-6",
            className: "text-[#CC2929]",
            trendDirection: "down",
        });
        expect(formatInventoryOverviewDelta(6, "alert")).toEqual({
            text: "+6",
            className: "text-[#CC2929]",
            trendDirection: "up",
        });
    });
});
