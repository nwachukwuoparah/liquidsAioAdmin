import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import {
    isRequestFromSupportedRegion,
    resolveRequestCountryCode,
    shouldEnforceGeoRestriction,
} from "@/lib/geo-region";
import { VERCEL_IP_COUNTRY_HEADER } from "@/lib/constants/supported-region.constant";

function createGeoRequest(countryCode?: string): NextRequest {
    const request = new NextRequest(new URL("http://localhost:3000/overview"));

    if (countryCode) {
        request.headers.set(VERCEL_IP_COUNTRY_HEADER, countryCode);
    }

    return request;
}

describe("geo-region", () => {
    it("resolves a request country code from geo headers", () => {
        expect(resolveRequestCountryCode(createGeoRequest("us"))).toBe("US");
    });

    it("resolves a request country code from request.geo", () => {
        const request = new NextRequest(new URL("http://localhost:3000/overview"));
        Object.defineProperty(request, "geo", {
            value: { country: "US" },
        });

        expect(resolveRequestCountryCode(request)).toBe("US");
    });

    it("allows supported regions during development", () => {
        vi.stubEnv("NODE_ENV", "development");

        expect(isRequestFromSupportedRegion(createGeoRequest("NG"))).toBe(true);
    });

    it("does not enforce geo restriction on Vercel preview/staging", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("VERCEL_ENV", "preview");

        expect(shouldEnforceGeoRestriction()).toBe(false);
        expect(isRequestFromSupportedRegion(createGeoRequest("NG"))).toBe(true);
    });

    // TODO(prod): unskip when shouldEnforceGeoRestriction is re-enabled
    it.skip("blocks unsupported regions in Vercel production", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("VERCEL_ENV", "production");
        vi.stubEnv("GEO_RESTRICTION_DISABLED", "false");

        expect(shouldEnforceGeoRestriction()).toBe(true);
        expect(isRequestFromSupportedRegion(createGeoRequest("NG"))).toBe(false);
        expect(isRequestFromSupportedRegion(createGeoRequest("US"))).toBe(true);
    });

    it("skips enforcement when GEO_RESTRICTION_DISABLED is true", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("VERCEL_ENV", "production");
        vi.stubEnv("GEO_RESTRICTION_DISABLED", "true");

        expect(shouldEnforceGeoRestriction()).toBe(false);
        expect(isRequestFromSupportedRegion(createGeoRequest("NG"))).toBe(true);
    });
});
