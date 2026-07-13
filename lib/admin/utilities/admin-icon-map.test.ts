import { describe, expect, it } from "vitest";
import { getAdminIconComponent } from "@/lib/admin/utilities/admin-icon-map";
import { TruckIcon } from "@/components/vector";

describe("getAdminIconComponent", () => {
    it("returns a mapped icon component for known keys", () => {
        expect(getAdminIconComponent("truck")).toBe(TruckIcon);
    });
});
