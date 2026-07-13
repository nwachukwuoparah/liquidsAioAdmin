import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { AUTH_LOGIN_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import { REGION_UNAVAILABLE_PATH, VERCEL_IP_COUNTRY_HEADER } from "@/lib/constants/supported-region.constant";
import { handleAppProxy } from "@/lib/proxy/app-proxy";

function createProxyRequest(pathname: string, countryCode?: string): NextRequest {
    const request = new NextRequest(new URL(`http://localhost:3000${pathname}`));

    if (countryCode) {
        request.headers.set(VERCEL_IP_COUNTRY_HEADER, countryCode);
    }

    return request;
}

describe("handleAppProxy", () => {
    it("redirects unsupported regions to the unavailable page in production", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("GEO_RESTRICTION_DISABLED", "false");

        const response = handleAppProxy(createProxyRequest("/overview", "NG"));

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(
            `http://localhost:3000${REGION_UNAVAILABLE_PATH}`,
        );
    });

    it("allows the unavailable page without redirecting again", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("GEO_RESTRICTION_DISABLED", "false");

        const response = handleAppProxy(createProxyRequest(REGION_UNAVAILABLE_PATH, "NG"));

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
    });

    it("allows supported regions through to auth redirects", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("GEO_RESTRICTION_DISABLED", "false");

        const response = handleAppProxy(createProxyRequest("/overview", "US"));

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(`http://localhost:3000${AUTH_LOGIN_ROUTE}`);
    });
});
