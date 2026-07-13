import { describe, expect, it } from "vitest";
import {
    AUTH_FORM_SCHEMA,
    adminLoginSchema,
    adminSignUpSchema,
    adminVerify2FaSchema,
    getAuthFormResolver,
    getAuthFormSchema,
} from "./index";

describe("getAuthFormSchema", () => {
    it("returns the login schema", () => {
        expect(getAuthFormSchema(AUTH_FORM_SCHEMA.LOGIN)).toBe(adminLoginSchema);
    });

    it("returns the sign-up schema", () => {
        expect(getAuthFormSchema(AUTH_FORM_SCHEMA.SIGN_UP)).toBe(adminSignUpSchema);
    });

    it("returns the verify 2FA schema", () => {
        expect(getAuthFormSchema(AUTH_FORM_SCHEMA.VERIFY_2FA)).toBe(adminVerify2FaSchema);
    });
});

describe("getAuthFormResolver", () => {
    it("validates login values through the named schema resolver", async () => {
        const resolver = getAuthFormResolver(AUTH_FORM_SCHEMA.LOGIN);
        const validationResult = await resolver(
            { email: "invalid-email", password: "short" },
            {},
            {
                criteriaMode: "firstError",
                fields: {},
                shouldUseNativeValidation: false,
            },
        );

        expect(validationResult.errors.email).toBeDefined();
        expect(validationResult.errors.password).toBeDefined();
    });
});
