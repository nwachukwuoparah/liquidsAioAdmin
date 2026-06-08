import { describe, expect, it } from "vitest";
import { getAdminPageTitle } from "./admin-page-title";

describe("getAdminPageTitle", () => {
    it("returns the title for each main admin route", () => {
        expect(getAdminPageTitle("/compliance")).toBe("Compliance");
        expect(getAdminPageTitle("/overview")).toBe("Overview");
        expect(getAdminPageTitle("/inventory")).toBe("Inventory");
        expect(getAdminPageTitle("/orders")).toBe("Orders");
        expect(getAdminPageTitle("/users")).toBe("All users");
        expect(getAdminPageTitle("/rfqs")).toBe("Buyer RFQs");
    });

    it("returns Settings for nested settings routes", () => {
        expect(getAdminPageTitle("/settings/profile")).toBe("Settings");
        expect(getAdminPageTitle("/settings/teams")).toBe("Settings");
    });

    it("falls back to Overview for unknown routes", () => {
        expect(getAdminPageTitle("/unknown")).toBe("Overview");
    });
});
