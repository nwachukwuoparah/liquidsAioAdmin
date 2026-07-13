import { describe, expect, it } from "vitest";
import { parseAdminSettingsGeneralResponse } from "./parse-admin-settings-general-response";

describe("parseAdminSettingsGeneralResponse", () => {
    it("unwraps camelCase company info fields from a success wrapper", () => {
        expect(
            parseAdminSettingsGeneralResponse({
                status: "success",
                data: {
                    contactEmail: "support@liquidsaio.com",
                    phoneNumber: "+15555550199",
                    phoneNumberCountryCode: "US",
                },
            }),
        ).toEqual({
            contactEmail: "support@liquidsaio.com",
            phoneNumber: "+15555550199",
            phoneNumberCountryCode: "US",
        });
    });

    it("supports snake_case field names", () => {
        expect(
            parseAdminSettingsGeneralResponse({
                status: "success",
                data: {
                    contact_email: "help@liquidsaio.com",
                    phone_number: "+18005550100",
                    phone_number_country_code: "US",
                },
            }),
        ).toEqual({
            contactEmail: "help@liquidsaio.com",
            phoneNumber: "+18005550100",
            phoneNumberCountryCode: "US",
        });
    });

    it("composes E.164 from a national phone number and country code", () => {
        expect(
            parseAdminSettingsGeneralResponse({
                status: "success",
                data: {
                    contactEmail: "ops@liquidsaio.com",
                    phoneNumber: "8005550100",
                    phoneNumberCountryCode: "US",
                },
            }),
        ).toEqual({
            contactEmail: "ops@liquidsaio.com",
            phoneNumber: "+18005550100",
            phoneNumberCountryCode: "US",
        });
    });

    it("reads nested company info payloads", () => {
        expect(
            parseAdminSettingsGeneralResponse({
                status: "success",
                data: {
                    companyInfo: {
                        contactEmail: "ops@liquidsaio.com",
                        phoneNumber: "+12125550101",
                        phoneNumberCountryCode: "US",
                    },
                },
            }),
        ).toEqual({
            contactEmail: "ops@liquidsaio.com",
            phoneNumber: "+12125550101",
            phoneNumberCountryCode: "US",
        });
    });

    it("returns empty fields when company info has not been created yet", () => {
        expect(parseAdminSettingsGeneralResponse({ status: "success", data: null })).toEqual({
            contactEmail: "",
            phoneNumber: "",
            phoneNumberCountryCode: "",
        });
    });

    it("defaults missing fields to empty strings", () => {
        expect(parseAdminSettingsGeneralResponse({ status: "success", data: {} })).toEqual({
            contactEmail: "",
            phoneNumber: "",
            phoneNumberCountryCode: "",
        });
    });
});
