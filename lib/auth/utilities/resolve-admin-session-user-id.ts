import { decodeAdminAccessTokenPayload } from "@/lib/auth/utilities/decode-access-token";
import { getAccessToken } from "@/lib/auth/utilities/auth-token-storage";

/**
 * Resolves the authenticated admin user id from the access-token JWT.
 * Prefers common claim keys used by the LiquidsAIO backend.
 */
export function resolveAdminSessionUserId(accessToken: string | null = getAccessToken()): string | null {
    if (!accessToken) {
        return null;
    }

    const payload = decodeAdminAccessTokenPayload(accessToken);

    if (!payload) {
        return null;
    }

    const claimSources: Record<string, unknown>[] = [payload];

    for (const nestedKey of ["admin", "user", "data"]) {
        const nestedValue = payload[nestedKey];
        if (nestedValue && typeof nestedValue === "object") {
            claimSources.push(nestedValue as Record<string, unknown>);
        }
    }

    for (const claimSource of claimSources) {
        for (const claimKey of ["sub", "userId", "user_id", "id", "adminId", "admin_id"]) {
            const claimValue = claimSource[claimKey];

            if (typeof claimValue === "string" && claimValue.trim()) {
                return claimValue.trim();
            }
        }
    }

    return null;
}
