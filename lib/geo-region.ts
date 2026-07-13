import type { NextRequest } from "next/server";
import {
    CLOUDFLARE_IP_COUNTRY_HEADER,
    CLOUDFRONT_VIEWER_COUNTRY_HEADER,
    GEO_RESTRICTION_DISABLED_ENV,
    SUPPORTED_COUNTRY_CODE,
    VERCEL_IP_COUNTRY_HEADER,
} from "@/lib/constants/supported-region.constant";

const REQUEST_COUNTRY_HEADER_KEYS = [
    VERCEL_IP_COUNTRY_HEADER,
    CLOUDFLARE_IP_COUNTRY_HEADER,
    CLOUDFRONT_VIEWER_COUNTRY_HEADER,
] as const;

const UNKNOWN_COUNTRY_CODES = new Set(["", "XX", "T1"]);

interface GeoAwareRequest {
    geo?: {
        country?: string;
    };
}

/**
 * Reads the best available ISO country code from common CDN/proxy headers.
 * @param request - Incoming Next.js request.
 */
function normalizeCountryCode(rawCountryCode: string | null | undefined): string | null {
    const normalizedCountryCode = rawCountryCode?.trim().toUpperCase();

    if (!normalizedCountryCode || UNKNOWN_COUNTRY_CODES.has(normalizedCountryCode)) {
        return null;
    }

    return normalizedCountryCode;
}

export function resolveRequestCountryCode(request: NextRequest): string | null {
    const geoCountryCode = normalizeCountryCode(
        (request as NextRequest & GeoAwareRequest).geo?.country,
    );

    if (geoCountryCode) {
        return geoCountryCode;
    }

    for (const headerName of REQUEST_COUNTRY_HEADER_KEYS) {
        const headerCountryCode = normalizeCountryCode(request.headers.get(headerName));

        if (headerCountryCode) {
            return headerCountryCode;
        }
    }

    return null;
}

/**
 * Returns whether geo restriction should run for the current deployment.
 */
export function shouldEnforceGeoRestriction(): boolean {
    if (process.env.NODE_ENV !== "production") {
        return false;
    }

    return process.env[GEO_RESTRICTION_DISABLED_ENV] !== "true";
}

/**
 * Returns whether the request originates from the supported service region.
 * @param request - Incoming Next.js request.
 */
export function isRequestFromSupportedRegion(request: NextRequest): boolean {
    if (!shouldEnforceGeoRestriction()) {
        return true;
    }

    const countryCode = resolveRequestCountryCode(request);

    if (!countryCode) {
        return true;
    }

    return countryCode === SUPPORTED_COUNTRY_CODE;
}
