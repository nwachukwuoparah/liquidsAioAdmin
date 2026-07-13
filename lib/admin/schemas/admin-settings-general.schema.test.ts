import { describe, expect, it } from "vitest";
import { adminSettingsGeneralSchema } from "./admin-settings-general.schema";

describe("adminSettingsGeneralSchema", () => {
    it("accepts a valid contact email and U.S. phone number", () => {
        const result = adminSettingsGeneralSchema.safeParse({
            contactEmail: "support@liquidsaio.com",
            phoneNumber: "+18005550199",
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual({
                contactEmail: "support@liquidsaio.com",
                phoneNumber: "+18005550199",
            });
        }
    });

    it("rejects a missing phone number", () => {
        const result = adminSettingsGeneralSchema.safeParse({
            contactEmail: "ops@liquidsaio.com",
            phoneNumber: "",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.message === "Phone number is required.")).toBe(
                true,
            );
        }
    });

    it("rejects undefined phone number from the country-only input state", () => {
        const result = adminSettingsGeneralSchema.safeParse({
            contactEmail: "ops@liquidsaio.com",
            phoneNumber: undefined,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.message === "Phone number is required.")).toBe(
                true,
            );
        }
    });

    it("rejects a missing contact email", () => {
        const result = adminSettingsGeneralSchema.safeParse({
            contactEmail: "   ",
            phoneNumber: "+18005550199",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Email is required.");
        }
    });

    it("rejects an invalid contact email", () => {
        const result = adminSettingsGeneralSchema.safeParse({
            contactEmail: "not-an-email",
            phoneNumber: "+18005550199",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Enter a valid email address.");
        }
    });

    it("rejects an invalid phone number", () => {
        const result = adminSettingsGeneralSchema.safeParse({
            contactEmail: "support@liquidsaio.com",
            phoneNumber: "+1555",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.message === "Enter a valid phone number.")).toBe(
                true,
            );
        }
    });
});
