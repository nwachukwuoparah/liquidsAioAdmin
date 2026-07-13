import { describe, expect, it } from "vitest";
import { adminSettingsProfileSchema } from "@/lib/admin/schemas/admin-settings-profile.schema";

describe("adminSettingsProfileSchema", () => {
    it("accepts a valid full name and U.S. phone number", () => {
        expect(
            adminSettingsProfileSchema.parse({
                fullName: "Samuel Nathaniel",
                phoneNumber: "+12124567890",
            }),
        ).toEqual({
            fullName: "Samuel Nathaniel",
            phoneNumber: "+12124567890",
        });
    });

    it("requires first and last name", () => {
        const result = adminSettingsProfileSchema.safeParse({
            fullName: "Samuel",
            phoneNumber: "+12124567890",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Enter your first and last name.");
        }
    });

    it("rejects an empty phone number", () => {
        const result = adminSettingsProfileSchema.safeParse({
            fullName: "Samuel Nathaniel",
            phoneNumber: undefined,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.message === "Phone number is required.")).toBe(
                true,
            );
        }
    });

    it("rejects a non-U.S. phone number", () => {
        const result = adminSettingsProfileSchema.safeParse({
            fullName: "Samuel Nathaniel",
            phoneNumber: "+447911123456",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.issues.some((issue) => issue.message === "Enter a valid U.S. phone number."),
            ).toBe(true);
        }
    });
});
