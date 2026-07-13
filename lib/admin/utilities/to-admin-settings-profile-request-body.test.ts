import { describe, expect, it, vi } from "vitest";
import { toAdminSettingsProfileRequestBody } from "@/lib/admin/utilities/to-admin-settings-profile-request-body";

vi.mock("@/lib/helpers/client-device", () => ({
    getClientTimezone: () => "America/New_York",
}));

describe("toAdminSettingsProfileRequestBody", () => {
    it("maps form values to PATCH /profile/admins with an auto-generated timezone", () => {
        expect(
            toAdminSettingsProfileRequestBody({
                fullName: "Samuel Nathaniel",
                phoneNumber: "+12124567890",
            }),
        ).toEqual({
            firstName: "Samuel",
            lastName: "Nathaniel",
            phoneNumber: "+12124567890",
            phoneNumberCountryCode: "US",
            timezone: "America/New_York",
        });
    });

    it("keeps multi-part last names together", () => {
        expect(
            toAdminSettingsProfileRequestBody({
                fullName: "Mary Ann Smith",
                phoneNumber: "+18005550100",
            }),
        ).toEqual({
            firstName: "Mary",
            lastName: "Ann Smith",
            phoneNumber: "+18005550100",
            phoneNumberCountryCode: "US",
            timezone: "America/New_York",
        });
    });
});
