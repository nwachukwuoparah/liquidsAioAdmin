import { describe, expect, it } from "vitest";
import { getInitialsFromName, getProfileAvatarInitials } from "./profile-avatar";

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

describe("getProfileAvatarInitials", () => {
    it("uses the first letter of email when no name is available", () => {
        expect(getProfileAvatarInitials("", "marvin@example.com")).toBe("M");
    });

    it("prefers name initials when a name is present", () => {
        expect(getProfileAvatarInitials("Jane Doe", "marvin@example.com")).toBe("JD");
    });
});
