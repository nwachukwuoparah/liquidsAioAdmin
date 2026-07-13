/** Primary supported country for LiquidsAIO admin access. */
export const SUPPORTED_COUNTRY_CODE = "US";

/** Route shown when a visitor is outside the supported service region. */
export const REGION_UNAVAILABLE_PATH = "/unavailable";

/** Vercel geo header for the request country code. */
export const VERCEL_IP_COUNTRY_HEADER = "x-vercel-ip-country";

/** Cloudflare geo header for the request country code. */
export const CLOUDFLARE_IP_COUNTRY_HEADER = "cf-ipcountry";

/** AWS CloudFront geo header for the request country code. */
export const CLOUDFRONT_VIEWER_COUNTRY_HEADER = "cloudfront-viewer-country";

/** Environment flag that disables geo restriction checks in production. */
export const GEO_RESTRICTION_DISABLED_ENV = "GEO_RESTRICTION_DISABLED";
