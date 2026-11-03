import { describe, expect, it } from "vitest";
import {
    formatDetailCurrency,
    formatFullDateTime,
    formatNegativeFee,
    formatShortDateTime,
    mapAdminOrderDetailApiRecord,
} from "./map-admin-order-detail-api-record";

describe("mapAdminOrderDetailApiRecord", () => {
    it("formats currency correctly", () => {
        expect(formatDetailCurrency(9000)).toBe("$9,000");
        expect(formatDetailCurrency("9000")).toBe("$9,000");
        expect(formatDetailCurrency("$9,000")).toBe("$9,000");
        expect(formatDetailCurrency(0)).toBe("—");
        expect(formatDetailCurrency(null)).toBe("—");
        expect(formatNegativeFee(200)).toBe("-$200");
        expect(formatNegativeFee(18)).toBe("-$18");
        expect(formatNegativeFee(0)).toBe("—");
        expect(formatNegativeFee(null)).toBe("—");
    });

    it("formats full date times and short date times", () => {
        const dt = "2025-07-05T14:00:00.000Z";
        const formatted = formatFullDateTime(dt);
        expect(formatted).toContain("2025");
        expect(formatted).toContain("|");

        const short = formatShortDateTime(dt);
        expect(short).toContain("Jul");
        expect(short).toContain("2025");
    });

    it("maps a full API record to the UI structure", () => {
        const sampleApiResponse = {
            data: {
                id: "ord-uuid-1",
                orderSummary: {
                    orderId: "#ORD-2024-001",
                    orderStatus: "Awaiting shipment",
                    quantity: 200,
                    unit: "pallets",
                },
                paymentSummary: {
                    paymentDate: "2025-07-05T14:00:00.000Z",
                    amount: 9000,
                    shippingFee: 200,
                    platformFee: 18,
                    sellerNetPayout: 8782,
                    payoutStatus: "In Escrow",
                    payoutDate: null,
                    payoutHold: null,
                },
                shippingInformation: {
                    carrier: "FedEx Freight",
                    trackingNumber: "FDX789456123",
                    shippedOn: "2025-11-05T12:44:00.000Z",
                    deliveredOn: null,
                },
                buyer: {
                    name: "John Peters",
                    email: "johnpeters@email.com",
                    phone: "+1 (555) 123-4567",
                },
                seller: {
                    name: "Savannah Cornor",
                    email: "savannahcornor@email.com",
                    phone: "+1 (555) 321-4567",
                },
            },
        };

        const result = mapAdminOrderDetailApiRecord(sampleApiResponse, "ORD-2024-001");

        expect(result.orderId).toBe("#ORD-2024-001");
        expect(result.orderStatus).toBe("Awaiting shipment");
        expect(result.orderQuantity).toBe("200 pallets");
        expect(result.seller.name).toBe("Savannah Cornor");
        expect(result.buyer.name).toBe("John Peters");
        expect(result.payment.amount).toBe("$9,000");
        expect(result.payment.shippingFee).toBe("-$200");
        expect(result.payment.platformFee).toBe("-$18");
        expect(result.payment.sellerNetPayout).toBe("$8,782");
        expect(result.payment.payoutStatus).toBe("In Escrow");
        expect(result.payment.isHeld).toBe(false);
        expect(result.shipping.carrier).toBe("FedEx Freight");
        expect(result.shipping.trackingNumber).toBe("FDX789456123");
        expect(result.timeline.stages.length).toBe(4);
        expect(result.timeline.stages[0].status).toBe("completed");
        expect(result.timeline.stages[1].status).toBe("current");
    });

    it("correctly identifies payout hold", () => {
        const responseWithHold = {
            data: {
                orderSummary: { orderId: "ORD-999", orderStatus: "Active" },
                paymentSummary: {
                    amount: 5000,
                    payoutHold: { reason: "Under investigation" },
                },
            },
        };

        const result = mapAdminOrderDetailApiRecord(responseWithHold, "ORD-999");
        expect(result.payment.isHeld).toBe(true);
        expect(result.payment.payoutStatus).toBe("On hold");
        expect(result.payment.holdReason).toBe("Under investigation");
    });

    it("handles dash or missing user names and parses DD-MM-YYYY dates", () => {
        const minimalResponse = {
            data: {
                orderSummary: {
                    orderId: "ORD_Tw0B-m4Kx-zlp8",
                    orderStatus: "succeeded",
                },
                paymentSummary: {
                    paymentDate: "19-09-2026",
                    amount: 0,
                },
                buyer: {
                    name: "buyer account",
                },
                seller: {
                    name: "—",
                },
            },
        };

        const result = mapAdminOrderDetailApiRecord(minimalResponse, "ORD_Tw0B-m4Kx-zlp8");
        expect(result.orderId).toBe("#ORD_Tw0B-m4Kx-zlp8");
        expect(result.orderStatus).toBe("succeeded");
        expect(result.seller.name).toBe("—");
        expect(result.seller.email).toBe("—");
        expect(result.seller.phone).toBe("—");
        expect(result.buyer.name).toBe("Buyer Account");
        expect(result.buyer.email).toBe("—");
        expect(result.buyer.phone).toBe("—");
        expect(result.shipping.carrier).toBe("—");
        expect(result.shipping.trackingNumber).toBe("—");
        expect(result.payment.shippingFee).toBe("—");
        expect(result.payment.platformFee).toBe("—");
        expect(result.payment.date).toContain("2026");
    });
});
