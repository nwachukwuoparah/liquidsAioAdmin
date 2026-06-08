import { describe, expect, it } from "vitest";
import { getInitialsFromName } from "./profile-avatar";

describe("getInitialsFromName", () => {
    it("returns first and last initials for full names", () => {
        expect(getInitialsFromName("Samuel Nathaniel")).toBe("SN");
    });

    it("returns first two letters for a single name", () => {
        expect(getInitialsFromName("Samuel")).toBe("SA");
    });

    it("returns a fallback for empty names", () => {
        expect(getInitialsFromName("   ")).toBe("?");
    });
});
