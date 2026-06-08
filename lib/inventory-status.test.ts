import { describe, expect, it } from "vitest";
import { getLotStatusStyles } from "./inventory-status";

describe("getLotStatusStyles", () => {
    it("maps pending status colors", () => {
        expect(getLotStatusStyles("Pending")).toEqual({
            text: "!text-[#DC6803]",
            bg: "bg-[#DC680314]",
            label: "Pending",
        });
    });

    it("maps active status colors", () => {
        expect(getLotStatusStyles("Active")).toEqual({
            text: "!text-[#00A341]",
            bg: "bg-[#00A34114]",
            label: "Active",
        });
    });

    it("maps declined status colors", () => {
        expect(getLotStatusStyles("declined")).toEqual({
            text: "!text-[#CC2929]",
            bg: "bg-[#CC292914]",
            label: "Declined",
        });
    });

    it("maps suspended to the same colors as declined", () => {
        const declined = getLotStatusStyles("Declined");
        const suspended = getLotStatusStyles("Suspended");

        expect(suspended.text).toBe(declined.text);
        expect(suspended.bg).toBe(declined.bg);
        expect(suspended).toEqual({
            text: "!text-[#CC2929]",
            bg: "bg-[#CC292914]",
            label: "Suspended",
        });
    });

    it("maps out-of-stock status colors", () => {
        expect(getLotStatusStyles("Out-of-stock")).toEqual({
            text: "!text-[#0B0E05]",
            bg: "bg-[#0B0E050A]",
            label: "Out-of-Stock",
        });
    });

    it("falls back for unknown statuses", () => {
        expect(getLotStatusStyles("Archived")).toEqual({
            text: "!text-[#0B0E05CC]",
            bg: "bg-[#0B0E050A]",
            label: "Archived",
        });
    });
});
