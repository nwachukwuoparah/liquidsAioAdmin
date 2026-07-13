import { describe, expect, it } from "vitest";
import { adminLoginSchema } from "./login.schema";

describe("adminLoginSchema", () => {
    it("accepts valid login credentials", () => {
        const parsedValues = adminLoginSchema.parse({
            email: "admin@liquidsaio.com",
            password: "password123",
        });

        expect(parsedValues.email).toBe("admin@liquidsaio.com");
    });

    it("rejects invalid email addresses", () => {
        const result = adminLoginSchema.safeParse({
            email: "not-an-email",
            password: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("rejects passwords below the minimum length", () => {
        const result = adminLoginSchema.safeParse({
            email: "admin@liquidsaio.com",
            password: "short",
        });

        expect(result.success).toBe(false);
    });
});
