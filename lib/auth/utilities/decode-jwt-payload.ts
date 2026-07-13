/**
 * Decodes a base64url-encoded JWT segment into a UTF-8 string.
 * @param base64UrlSegment - Encoded JWT header or payload segment.
 */
function decodeBase64UrlSegment(base64UrlSegment: string): string {
    const base64 = base64UrlSegment.replace(/-/g, "+").replace(/_/g, "/");
    const paddingLength = (4 - (base64.length % 4)) % 4;
    const paddedBase64 = base64 + "=".repeat(paddingLength);

    if (typeof atob === "function") {
        return atob(paddedBase64);
    }

    return Buffer.from(paddedBase64, "base64").toString("utf-8");
}

/**
 * Decodes a JWT payload without verifying its signature.
 * @param jsonWebToken - JWT string from an API response or invite link.
 */
export function decodeJwtPayload<TPayload extends Record<string, unknown>>(
    jsonWebToken: string,
): TPayload | null {
    const tokenParts = jsonWebToken.split(".");
    if (tokenParts.length !== 3) {
        return null;
    }

    try {
        const payloadJson = decodeBase64UrlSegment(tokenParts[1]);
        return JSON.parse(payloadJson) as TPayload;
    } catch {
        return null;
    }
}
