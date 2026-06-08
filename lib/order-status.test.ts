import { describe, expect, it } from "vitest";
import { getOrderStatusStyles, getPaymentStatusStyles } from "./order-status";

describe("getOrderStatusStyles", () => {
    it("maps order completed colors", () => {
        expect(getOrderStatusStyles("Order completed")).toEqual({
            text: "!text-[#518300]",
            bg: "bg-[#B1EC521A]",
            label: "Order completed",
        });
    });

    it("maps dispute and cancelled to red", () => {
        expect(getOrderStatusStyles("Dispute").text).toBe("!text-[#CC2929]");
        expect(getOrderStatusStyles("Cancelled").bg).toBe("bg-[#CC292914]");
    });

    it("maps in-transit to orange", () => {
        expect(getOrderStatusStyles("In-transit")).toEqual({
            text: "!text-[#DC6803]",
            bg: "bg-[#DC680314]",
            label: "In-transit",
        });
    });
});

describe("getPaymentStatusStyles", () => {
    it("maps released to green", () => {
        expect(getPaymentStatusStyles("Released")).toEqual({
            text: "!text-[#00A341]",
            bg: "bg-[#00A34114]",
            label: "Released",
        });
    });

    it("maps in escrow to orange", () => {
        expect(getPaymentStatusStyles("In Escrow")).toEqual({
            text: "!text-[#DC6803]",
            bg: "bg-[#DC680314]",
            label: "In Escrow",
        });
    });

    it("maps refunded to neutral", () => {
        expect(getPaymentStatusStyles("Refunded")).toEqual({
            text: "!text-[#0B0E05]",
            bg: "bg-[#0B0E050A]",
            label: "Refunded",
        });
    });
});
