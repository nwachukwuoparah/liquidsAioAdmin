import { describe, expect, it } from "vitest";
import { adminSignUpSchema, toAdminSignUpRequestBody } from "./sign-up.schema";

describe("adminSignUpSchema", () => {
    it("accepts valid sign-up values", () => {
        const parsedValues = adminSignUpSchema.parse({
            firstName: "Amina",
            lastName: "Okoro",
            password: "SecureAdminPassword123!",
            confirmPassword: "SecureAdminPassword123!",
            phoneNumber: "+12025550123",
        });

        expect(parsedValues.phoneNumber).toBe("+12025550123");
    });

    it("rejects mismatched passwords", () => {
        const result = adminSignUpSchema.safeParse({
            firstName: "Amina",
            lastName: "Okoro",
            password: "SecureAdminPassword123!",
            confirmPassword: "DifferentPassword123!",
            phoneNumber: "+12025550123",
        });

        expect(result.success).toBe(false);
    });

    it("rejects invalid phone numbers", () => {
        const result = adminSignUpSchema.safeParse({
            firstName: "Amina",
            lastName: "Okoro",
            password: "SecureAdminPassword123!",
            confirmPassword: "SecureAdminPassword123!",
            phoneNumber: "123",
        });

        expect(result.success).toBe(false);
    });

    it("rejects non-U.S. phone numbers", () => {
        const result = adminSignUpSchema.safeParse({
            firstName: "Amina",
            lastName: "Okoro",
            password: "SecureAdminPassword123!",
            confirmPassword: "SecureAdminPassword123!",
            phoneNumber: "+447911123456",
        });

        expect(result.success).toBe(false);
    });
});

describe("toAdminSignUpRequestBody", () => {
    it("derives phoneNumberCountryCode from the E.164 phone number", () => {
        const requestBody = toAdminSignUpRequestBody({
            firstName: "Amina",
            lastName: "Okoro",
            password: "SecureAdminPassword123!",
            confirmPassword: "SecureAdminPassword123!",
            phoneNumber: "+12025550123",
        });

        expect(requestBody.phoneNumberCountryCode).toBe("US");
        expect(requestBody).not.toHaveProperty("confirmPassword");
    });
});
