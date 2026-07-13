import { describe, expect, it } from "vitest";
import {
    buildAdminPermissionCatalog,
    formatAdminPermissionLabel,
    isGlobalWildcardPermission,
    sortAdminPermissionCatalog,
} from "./admin-permission-catalog";

describe("formatAdminPermissionLabel", () => {
    it("includes scoped settings variants distinctly", () => {
        expect(
            formatAdminPermissionLabel({
                id: "1",
                resource: "settings",
                action: "view",
                scope: "general",
            }),
        ).toBe("View settings · general");
        expect(
            formatAdminPermissionLabel({
                id: "2",
                resource: "settings",
                action: "edit",
                scope: "teams",
            }),
        ).toBe("Edit settings · teams");
    });

    it("labels resource-level wildcards as manage", () => {
        expect(
            formatAdminPermissionLabel({
                id: "3",
                resource: "settings",
                action: "*",
                scope: "*",
            }),
        ).toBe("Manage settings");
    });
});

describe("buildAdminPermissionCatalog", () => {
    it("merges role permission variants missing from the top-level catalog", () => {
        const catalog = buildAdminPermissionCatalog(
            [
                { id: "view-settings", resource: "settings", action: "view", scope: "*" },
            ],
            [
                {
                    permissions: [
                        { id: "view-settings", resource: "settings", action: "view", scope: "*" },
                        { id: "edit-settings-general", resource: "settings", action: "edit", scope: "general" },
                        { id: "edit-settings-teams", resource: "settings", action: "edit", scope: "teams" },
                        { id: "edit-settings-profile", resource: "settings", action: "edit", scope: "profile" },
                        { id: "all-access", resource: "*", action: "*", scope: "*" },
                    ],
                },
            ],
        );

        expect(catalog.map((permission) => permission.id)).toEqual([
            "edit-settings-general",
            "edit-settings-profile",
            "edit-settings-teams",
            "view-settings",
        ]);
    });

    it("keeps resource wildcards so manage variants remain visible", () => {
        const catalog = buildAdminPermissionCatalog(
            [
                { id: "manage-settings", resource: "settings", action: "*", scope: "*" },
                { id: "view-settings", resource: "settings", action: "view", scope: "*" },
            ],
            [],
        );

        expect(catalog.map((permission) => formatAdminPermissionLabel(permission))).toEqual([
            "Manage settings",
            "View settings",
        ]);
    });

    it("keeps distinct scopes even when permission ids collide", () => {
        const catalog = buildAdminPermissionCatalog(
            [
                { id: "settings-edit", resource: "settings", action: "edit", scope: "general" },
                { id: "settings-edit", resource: "settings", action: "edit", scope: "teams" },
            ],
            [],
        );

        expect(catalog.map((permission) => formatAdminPermissionLabel(permission))).toEqual([
            "Edit settings · general",
            "Edit settings · teams",
        ]);
    });
});

describe("isGlobalWildcardPermission", () => {
    it("detects only the full *:*:* permission", () => {
        expect(isGlobalWildcardPermission({ resource: "*", action: "*", scope: "*" })).toBe(true);
        expect(isGlobalWildcardPermission({ resource: "settings", action: "*", scope: "*" })).toBe(
            false,
        );
    });
});

describe("sortAdminPermissionCatalog", () => {
    it("keeps role defaults ahead of optional grants", () => {
        const sorted = sortAdminPermissionCatalog(
            [
                { id: "edit", resource: "settings", action: "edit", scope: "general" },
                { id: "view", resource: "settings", action: "view", scope: "*" },
            ],
            new Set(["view"]),
        );

        expect(sorted.map((permission) => permission.id)).toEqual(["view", "edit"]);
    });
});
