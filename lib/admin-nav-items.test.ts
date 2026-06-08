import { describe, expect, it } from "vitest";
import { ADMIN_BOTTOM_NAV_ITEMS, ADMIN_NAV_ITEMS, isAdminNavItemActive } from "./admin-nav-items";

describe("admin nav items", () => {
    it("excludes settings from bottom navigation", () => {
        expect(ADMIN_BOTTOM_NAV_ITEMS).toHaveLength(6);
        expect(ADMIN_BOTTOM_NAV_ITEMS.some((item) => item.pathname === "/settings")).toBe(false);
        expect(ADMIN_NAV_ITEMS.some((item) => item.pathname === "/settings")).toBe(true);
    });

    it("marks the matching route active on load", () => {
        expect(isAdminNavItemActive("/compliance", "/compliance")).toBe(true);
        expect(isAdminNavItemActive("/settings/profile", "/settings")).toBe(true);
        expect(isAdminNavItemActive("/inventory", "/orders")).toBe(false);
    });
});
