import { describe, expect, it } from "vitest";
import { mapAdminOrderApiRecord } from "./map-admin-order-api-record";
import type { AdminOrderApiRecord } from "@/lib/orders/types/admin-orders-api.types";

describe("mapAdminOrderApiRecord", () => {
    it("maps Order ID with # prefix preserving ORD- format", () => {
        const record: AdminOrderApiRecord = {
            id: "d4b00001-1111-4000-8000-000000000001",
            order_id: "#ORD-2024-001",
            lot: {
                title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers",
            },
            seller: "Savannah Nguyen",
            buyer: "John Peters",
            amount: 9000,
            payment_status: "processing",
            order_status: "active",
            created_at: "2025-07-05T14:32:00.000Z",
        };

        const result = mapAdminOrderApiRecord(record, 0);

        expect(result.orderId).toBe("#ORD-2024-001");
        expect(result.internalId).toBe("d4b00001-1111-4000-8000-000000000001");
        expect(result.uuid).toBe("d4b00001-1111-4000-8000-000000000001");
        expect(result.title).toBe("Mixed Electronics Pallet – Headphones, Speakers, Chargers");
    });

    it("formats unprefixed ORD_ or ORD- properly as #ORD-...", () => {
        const record: AdminOrderApiRecord = {
            id: "order-1",
            order_id: "ORD-2024-002",
            lot: {
                title: "Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)",
            },
        };

        const result = mapAdminOrderApiRecord(record, 1);
        expect(result.orderId).toBe("#ORD-2024-002");
        expect(result.title).toBe("Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)");
    });

    it("resolves lot.title with priority over record.title", () => {
        const record: AdminOrderApiRecord = {
            id: "order-3",
            order_id: "#ORD-2024-003",
            title: "Fallback Title",
            lot: {
                title: "Kitchenware Overstock – 2 Pallets (Cookware & Utensils)",
            },
        };

        const result = mapAdminOrderApiRecord(record, 2);
        expect(result.title).toBe("Kitchenware Overstock – 2 Pallets (Cookware & Utensils)");
    });

    it("handles fallback to record.title when lot is not present", () => {
        const record: AdminOrderApiRecord = {
            id: "order-4",
            order_id: "#ORD-2024-004",
            title: "Beauty & Cosmetics Lot – 500 Units",
        };

        const result = mapAdminOrderApiRecord(record, 3);
        expect(result.orderId).toBe("#ORD-2024-004");
        expect(result.title).toBe("Beauty & Cosmetics Lot – 500 Units");
    });

    it("extracts image URL when lot.images is an array of objects", () => {
        const record: AdminOrderApiRecord = {
            id: "order-5",
            order_id: "#ORD-NPDH-7QBH-8VHV",
            lot: {
                title: "Pre-Seasoned Cast Iron Skillet (10-Inch)",
                images: [{ url: "https://example.com/skillet.jpg" } as any],
            },
        };

        const result = mapAdminOrderApiRecord(record, 4);
        expect(result.thumbnailUrl).toBe("https://example.com/skillet.jpg");
    });

    it("uses cast iron skillet fallback image when lot image is missing", () => {
        const record: AdminOrderApiRecord = {
            id: "order-6",
            order_id: "#ORD-XFEE-QTN7-II8A",
            lot: {
                title: "Pre-Seasoned Cast Iron Skillet (10-Inch)",
                images: [],
            },
        };

        const result = mapAdminOrderApiRecord(record, 5);
        expect(result.thumbnailUrl).toBeDefined();
        expect(result.thumbnailUrl).toContain("unsplash.com");
    });

    it("ignores malformed object strings like [object Object] and falls back safely", () => {
        const record: AdminOrderApiRecord = {
            id: "order-7",
            order_id: "#ORD-XFEE-QTN7-II8B",
            thumbnailUrl: "[object Object]" as any,
            lot: {
                title: "Pre-Seasoned Cast Iron Skillet (10-Inch)",
            },
        };

        const result = mapAdminOrderApiRecord(record, 6);
        expect(result.thumbnailUrl).not.toBe("[object Object]");
        expect(result.thumbnailUrl).toContain("unsplash.com");
    });

    it("normalizes processing and empty payment status to Pending", () => {
        const record: AdminOrderApiRecord = {
            id: "order-8",
            payment_status: "processing",
        };

        const result = mapAdminOrderApiRecord(record, 7);
        expect(result.payStatus).toBe("Pending");

        const emptyRecord: AdminOrderApiRecord = {
            id: "order-9",
        };
        const emptyResult = mapAdminOrderApiRecord(emptyRecord, 8);
        expect(emptyResult.payStatus).toBe("Pending");
    });

    it("populates seller, buyer, amount, orderStatus and paymentStatus when backend sends status 'succeeded' and 0 amount", () => {
        const record: AdminOrderApiRecord = {
            id: "order-10",
            order_id: "ORD_Tw0B-m4Kx-zlp8",
            lot: {
                title: "ApexPro Active Noise-Cancelling Wireless Headphones",
            },
            buyer: "buyer account",
            amount: 0,
            status: "succeeded",
            created_at: "19-09-2026",
        };

        const result = mapAdminOrderApiRecord(record, 0);

        expect(result.orderId).toBe("#ORD_Tw0B-m4Kx-zlp8");
        expect(result.rawId).toBe("ORD_Tw0B-m4Kx-zlp8");
        expect(result.title).toBe("ApexPro Active Noise-Cancelling Wireless Headphones");
        expect(result.seller).toBe("Savannah Nguyen");
        expect(result.buyer).toBe("Buyer Account");
        expect(result.amount).toBe("$1,200");
        expect(result.payStatus).toBe("Released");
        expect(result.orderStatus).toBe("Awaiting shipment");
        expect(result.date).toBe("19-09-2026");
    });

    it("extracts seller from lot.creator profile with businessName", () => {
        const record: AdminOrderApiRecord = {
            id: "order-11",
            order_id: "#ORD_8EWH-1bl1-7Oni",
            lot: {
                title: "Custom Inventory Lot",
                creator: {
                    businessName: "Extelvo Supplies",
                },
            },
            buyer: {
                name: "buyer account",
            },
        };

        const result = mapAdminOrderApiRecord(record, 1);
        expect(result.seller).toBe("Extelvo Supplies");
        expect(result.buyer).toBe("Buyer Account");
        expect(result.amount).not.toBe("$0");
    });
});
