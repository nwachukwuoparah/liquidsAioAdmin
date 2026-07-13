import { describe, expect, it } from "vitest";
import { normalizeCompanyPhoneToE164 } from "./normalize-company-phone-e164";

describe("normalizeCompanyPhoneToE164", () => {
    it("returns empty string for blank phone numbers", () => {
        expect(normalizeCompanyPhoneToE164("", "US")).toBe("");
        expect(normalizeCompanyPhoneToE164("   ")).toBe("");
    });

    it("keeps valid E.164 phone numbers", () => {
        expect(normalizeCompanyPhoneToE164("+18005550199", "US")).toBe("+18005550199");
    });

    it("composes E.164 from a national number and country code", () => {
        expect(normalizeCompanyPhoneToE164("8005550199", "US")).toBe("+18005550199");
    });

    it("normalizes formatted international numbers", () => {
        expect(normalizeCompanyPhoneToE164("+1 (800) 555-0199", "US")).toBe("+18005550199");
    });

    it("defaults to US when country code is missing", () => {
        expect(normalizeCompanyPhoneToE164("5555550199")).toBe("+15555550199");
    });
});
