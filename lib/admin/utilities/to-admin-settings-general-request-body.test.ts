import { describe, expect, it } from "vitest";
import { toAdminSettingsGeneralRequestBody } from "./to-admin-settings-general-request-body";

describe("toAdminSettingsGeneralRequestBody", () => {
    it("includes phone fields when a phone number is provided", () => {
        expect(
            toAdminSettingsGeneralRequestBody({
                contactEmail: " ops@liquidsaio.com ",
                phoneNumber: "+18005550100",
            }),
        ).toEqual({
            contactEmail: "ops@liquidsaio.com",
            phoneNumber: "+18005550100",
            phoneNumberCountryCode: "US",
        });
    });

    it("omits both phone fields when the phone number is empty", () => {
        expect(
            toAdminSettingsGeneralRequestBody({
                contactEmail: "support@liquidsaio.com",
                phoneNumber: "   ",
            }),
        ).toEqual({
            contactEmail: "support@liquidsaio.com",
        });
    });
});
