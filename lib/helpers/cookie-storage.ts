import {
    AUTH_COOKIE_PATH,
    AUTH_COOKIE_SAME_SITE_POLICY,
} from "@/lib/auth/constants/auth-api.constant";

interface SetCookieOptions {
    maxAgeSeconds: number;
    path?: string;
    sameSite?: "Lax" | "Strict" | "None";
}

function canUseDocumentCookies(): boolean {
    return typeof document !== "undefined";
}

/**
 * Reads a cookie value by name.
 * @param cookieName - Cookie key to read.
 */
export function getCookieValue(cookieName: string): string | null {
    if (!canUseDocumentCookies()) {
        return null;
    }

    const encodedCookiePrefix = `${encodeURIComponent(cookieName)}=`;
    const cookieEntries = document.cookie.split("; ");

    for (const cookieEntry of cookieEntries) {
        if (cookieEntry.startsWith(encodedCookiePrefix)) {
            return decodeURIComponent(cookieEntry.slice(encodedCookiePrefix.length));
        }
    }

    return null;
}

/**
 * Writes a cookie value with the provided lifetime.
 * @param cookieName - Cookie key to write.
 * @param cookieValue - Value to persist.
 * @param options - Cookie lifetime and scope options.
 */
export function setCookieValue(
    cookieName: string,
    cookieValue: string,
    options: SetCookieOptions,
): void {
    if (!canUseDocumentCookies()) {
        return;
    }

    const cookiePath = options.path ?? AUTH_COOKIE_PATH;
    const sameSitePolicy = options.sameSite ?? AUTH_COOKIE_SAME_SITE_POLICY;
    const secureFlag =
        typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = [
        `${encodeURIComponent(cookieName)}=${encodeURIComponent(cookieValue)}`,
        `Path=${cookiePath}`,
        `Max-Age=${options.maxAgeSeconds}`,
        `SameSite=${sameSitePolicy}`,
        secureFlag,
    ]
        .filter(Boolean)
        .join("; ");
}

/**
 * Deletes a cookie by expiring it immediately.
 * @param cookieName - Cookie key to remove.
 */
export function deleteCookieValue(cookieName: string): void {
    setCookieValue(cookieName, "", { maxAgeSeconds: 0 });
}

/**
 * Clears all cookies currently visible to the page.
 * Intended for tests.
 */
export function clearAllCookiesForTests(): void {
    if (!canUseDocumentCookies()) {
        return;
    }

    const cookieEntries = document.cookie.split("; ").filter(Boolean);

    for (const cookieEntry of cookieEntries) {
        const cookieName = cookieEntry.split("=")[0];
        if (cookieName) {
            deleteCookieValue(decodeURIComponent(cookieName));
        }
    }
}
