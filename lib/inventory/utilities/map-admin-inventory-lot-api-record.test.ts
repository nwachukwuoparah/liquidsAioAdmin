import { describe, expect, it } from "vitest";
import {
    isLotImageUrl,
    mapAdminInventoryLotApiRecord,
} from "./map-admin-inventory-lot-api-record";

describe("mapAdminInventoryLotApiRecord", () => {
    it("maps backend lot records into admin table rows", () => {
        const row = mapAdminInventoryLotApiRecord(
            {
                id: "019d97d2-21d8-7336-95ea-88bee39b084d",
                title: "Mixed electronics pallet",
                category: "elt",
                condition: "mixed",
                unitQuantity: 50,
                minimumOrderQuantity: 10,
                price: 200,
                reviewStatus: "pending",
                createdAt: "2026-07-01T12:34:56.000Z",
                creator: {
                    firstName: "John",
                    lastName: "Stockton",
                },
                images: [{ url: "https://example.com/lot.jpg", position: 0 }],
            },
            0,
        );

        expect(row.id).toBe("019d97d2-21d8-7336-95ea-88bee39b084d");
        expect(row.title).toBe("Mixed electronics pallet");
        expect(row.seller).toBe("John Stockton");
        expect(row.cat).toBe("Electronics");
        expect(row.qty).toBe(50);
        expect(row.price).toBe("$200");
        expect(row.cond).toBe("Mixed");
        expect(row.status).toBe("Pending");
        expect(row.img).toBe("https://example.com/lot.jpg");
    });

    it("marks lots as out-of-stock when quantity is below MOQ", () => {
        const row = mapAdminInventoryLotApiRecord(
            {
                id: "lot-2",
                title: "Low stock lot",
                unit_quantity: 3,
                minimum_order_quantity: 10,
                review_status: "approved",
            },
            1,
        );

        expect(row.status).toBe("Out-of-stock");
    });

    it("uses fallback background classes when images are missing", () => {
        const row = mapAdminInventoryLotApiRecord(
            {
                id: "lot-3",
                title: "No image lot",
            },
            2,
        );

        expect(row.img).toBe("bg-red-100");
        expect(isLotImageUrl(row.img)).toBe(false);
    });

    it("maps review statuses to display labels", () => {
        expect(
            mapAdminInventoryLotApiRecord({ id: "1", reviewStatus: "approved" }, 0).status,
        ).toBe("Active");
        expect(
            mapAdminInventoryLotApiRecord({ id: "2", reviewStatus: "rejected" }, 0).status,
        ).toBe("Declined");
        expect(
            mapAdminInventoryLotApiRecord({ id: "3", reviewStatus: "suspended" }, 0).status,
        ).toBe("Suspended");
    });
});
