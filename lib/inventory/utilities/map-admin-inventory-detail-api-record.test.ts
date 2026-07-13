import { describe, expect, it } from "vitest";
import {
    canReviewInventoryLot,
    canSuspendInventoryLot,
    canViewLiveInventoryListing,
    mapAdminInventoryLotDetailApiRecord,
} from "./map-admin-inventory-detail-api-record";

describe("mapAdminInventoryLotDetailApiRecord", () => {
    it("maps lot detail payloads into modal records", () => {
        const detail = mapAdminInventoryLotDetailApiRecord({
            id: "lot-1",
            title: "Mixed Electronics Pallet",
            description: "Consumer electronics lot.",
            category: "elt",
            condition: "new",
            skuType: "single_sku",
            unitQuantity: 30,
            minimumOrderQuantity: 10,
            pricePerUnit: 75,
            totalPrice: 2250,
            reviewStatus: "pending",
            createdAt: "2026-07-07T10:00:00.000Z",
            updatedAt: "2026-07-08T13:00:00.000Z",
            views: 507,
            offers: 13,
            totalOrders: 2,
            shippingFrom: "Dallas, TX 75240",
            shippingTerms: "Buyer arranged shipping",
            creator: {
                firstName: "John",
                lastName: "Peters",
                email: "john@example.com",
                phone: "+1 555 123 4567",
                rating: 4.8,
                accountHealth: 99,
            },
            images: [{ url: "https://example.com/lot.jpg", position: 0 }],
        });

        expect(detail.title).toBe("Mixed Electronics Pallet");
        expect(detail.status).toBe("Pending");
        expect(detail.category).toBe("Electronics");
        expect(detail.seller.name).toBe("John Peters");
        expect(detail.totalPrice).toBe(2250);
    });
});

describe("lot detail action visibility helpers", () => {
    it("shows review actions for pending lots", () => {
        expect(canReviewInventoryLot({ reviewStatus: "pending", status: "Pending" })).toBe(true);
    });

    it("shows suspend for active or reported lots", () => {
        expect(canSuspendInventoryLot({ status: "Active", reported: false })).toBe(true);
        expect(canSuspendInventoryLot({ status: "Pending", reported: true })).toBe(true);
    });

    it("shows listing link only for approved lots with a url", () => {
        expect(
            canViewLiveInventoryListing({
                reviewStatus: "approved",
                status: "Active",
                listingUrl: "https://example.com/lot-1",
            }),
        ).toBe(true);
        expect(
            canViewLiveInventoryListing({
                reviewStatus: "pending",
                status: "Pending",
                listingUrl: "https://example.com/lot-1",
            }),
        ).toBe(false);
    });
});
