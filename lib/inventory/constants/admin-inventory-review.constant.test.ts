import { describe, expect, it } from "vitest";
import {
    buildAdminLotSuspendReason,
    getAdminLotApprovePath,
    getAdminLotDetailPath,
    getAdminLotRejectPath,
    getAdminLotSuspendPath,
} from "./admin-inventory-review.constant";

describe("admin inventory review path helpers", () => {
    it("builds the lot detail path from a slug", () => {
        expect(getAdminLotDetailPath("iphone-taahoilo5ufz")).toBe("/lots/iphone-taahoilo5ufz");
    });

    it("builds the lot detail path from a UUID via by-id", () => {
        expect(getAdminLotDetailPath("019d97d2-21d8-7336-95ea-88bee39b084d")).toBe(
            "/lots/by-id/019d97d2-21d8-7336-95ea-88bee39b084d",
        );
    });

    it("builds the approve path", () => {
        expect(getAdminLotApprovePath("lot-1")).toBe("/lots/lot-1/approve");
    });

    it("builds the reject path", () => {
        expect(getAdminLotRejectPath("lot-1")).toBe("/lots/lot-1/reject");
    });

    it("builds the suspend path", () => {
        expect(getAdminLotSuspendPath("lot-1")).toBe("/lots/lot-1/suspend");
    });
});

describe("buildAdminLotSuspendReason", () => {
    it("returns the option label for a listed reason", () => {
        expect(buildAdminLotSuspendReason("prohibited_item")).toBe("Prohibited or restricted item");
    });

    it("returns the free-text note for Other", () => {
        expect(buildAdminLotSuspendReason("other", "Too many reports")).toBe("Too many reports");
    });
});
