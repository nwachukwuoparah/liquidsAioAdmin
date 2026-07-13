import { describe, expect, it } from "vitest";
import { parseAdminSettingsProfileFromUserDetail } from "@/lib/admin/utilities/parse-admin-settings-profile-response";

describe("parseAdminSettingsProfileFromUserDetail", () => {
    it("maps admin GET /profile/me data.profile fields into profile settings values", () => {
        expect(
            parseAdminSettingsProfileFromUserDetail({
                status: "success",
                data: {
                    profile: {
                        firstName: "Jude",
                        lastName: "Nnamdi",
                        email: "jude@dummyinbox.com",
                        phoneNumber: "5550100123",
                        phoneNumberCountryCode: "US",
                        timezone: "gmt-05",
                        profilePicture: "https://cdn.example.com/jude.jpg",
                    },
                },
            }),
        ).toEqual({
            firstName: "Jude",
            lastName: "Nnamdi",
            email: "jude@dummyinbox.com",
            phone: "+15550100123",
            phoneNumberCountryCode: "US",
            timezone: "gmt-05",
            profileImageUrl: "https://cdn.example.com/jude.jpg",
        });
    });

    it("falls back to nested user detail when profile is absent", () => {
        expect(
            parseAdminSettingsProfileFromUserDetail({
                status: "success",
                data: {
                    user: {
                        firstName: "Jude",
                        lastName: "Nnamdi",
                        email: "jude@dummyinbox.com",
                        phone: "555-010-0123",
                        timezone: "gmt-05",
                        profilePicture: "https://cdn.example.com/jude.jpg",
                    },
                },
            }),
        ).toEqual({
            firstName: "Jude",
            lastName: "Nnamdi",
            email: "jude@dummyinbox.com",
            phone: "+15550100123",
            phoneNumberCountryCode: null,
            timezone: "gmt-05",
            profileImageUrl: "https://cdn.example.com/jude.jpg",
        });
    });

    it("falls back to KYC phone when the top-level phone is missing", () => {
        expect(
            parseAdminSettingsProfileFromUserDetail({
                firstName: "Emeka",
                lastName: "Nnamdi",
                email: "emeka@dummyinbox.com",
                kyc: { phoneNumber: "212-456-7890" },
            }),
        ).toMatchObject({
            firstName: "Emeka",
            phone: "+12124567890",
            email: "emeka@dummyinbox.com",
            timezone: "gmt-05",
        });
    });
});
