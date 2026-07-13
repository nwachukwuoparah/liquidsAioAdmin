import {
    CLIENT_DEVICE_NAME_FALLBACK,
    CLIENT_TIMEZONE_FALLBACK,
} from "@/lib/api/constants/client-device.constant";
import {
    DEVICE_ID_COOKIE_MAX_AGE_SECONDS,
    DEVICE_ID_STORAGE_KEY,
} from "@/lib/auth/constants/auth-api.constant";
import { getCookieValue, setCookieValue } from "@/lib/helpers/cookie-storage";

const BROWSER_USER_AGENT_PATTERNS: ReadonlyArray<[RegExp, string]> = [
    [/Edg\//, "Edge"],
    [/OPR\//, "Opera"],
    [/Chrome\//, "Chrome"],
    [/Firefox\//, "Firefox"],
    [/Safari\//, "Safari"],
];

/** Generates a new UUID suitable for use as a device identifier. */
function generateDeviceId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (placeholderChar) => {
        const randomNibble = (Math.random() * 16) | 0;
        const nibbleValue =
            placeholderChar === "x" ? randomNibble : (randomNibble & 0x3) | 0x8;

        return nibbleValue.toString(16);
    });
}

/** Reads a browser name from the user agent string. */
function getBrowserNameFromUserAgent(userAgent: string): string {
    for (const [browserPattern, browserName] of BROWSER_USER_AGENT_PATTERNS) {
        if (browserPattern.test(userAgent)) {
            return browserName;
        }
    }

    return "Browser";
}

/** Reads an operating system name from the user agent string. */
function getOperatingSystemNameFromUserAgent(userAgent: string, platform: string): string {
    if (/Mac OS X|Macintosh/.test(userAgent)) {
        return "macOS";
    }

    if (/Windows/.test(userAgent)) {
        return "Windows";
    }

    if (/Android/.test(userAgent)) {
        return "Android";
    }

    if (/iPhone|iPad|iPod/.test(userAgent)) {
        return "iOS";
    }

    if (/Linux/.test(userAgent)) {
        return "Linux";
    }

    return platform || "Unknown";
}

/**
 * Returns a stable device identifier for this browser.
 * Creates and persists a UUID on first use.
 */
export function getClientDeviceId(): string {
    const storedDeviceId = getCookieValue(DEVICE_ID_STORAGE_KEY);

    if (storedDeviceId) {
        return storedDeviceId;
    }

    const newDeviceId = generateDeviceId();

    setCookieValue(DEVICE_ID_STORAGE_KEY, newDeviceId, {
        maxAgeSeconds: DEVICE_ID_COOKIE_MAX_AGE_SECONDS,
    });

    return newDeviceId;
}

/**
 * Returns a human-readable device name derived from the current browser environment.
 */
export function getClientDeviceName(): string {
    if (typeof navigator === "undefined") {
        return CLIENT_DEVICE_NAME_FALLBACK;
    }

    const browserName = getBrowserNameFromUserAgent(navigator.userAgent);
    const operatingSystemName = getOperatingSystemNameFromUserAgent(
        navigator.userAgent,
        navigator.platform,
    );

    return `${browserName} on ${operatingSystemName}`;
}

/** Returns the IANA timezone for the current runtime environment. */
export function getClientTimezone(): string {
    try {
        const resolvedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (resolvedTimezone) {
            return resolvedTimezone;
        }
    } catch {
        return CLIENT_TIMEZONE_FALLBACK;
    }

    return CLIENT_TIMEZONE_FALLBACK;
}
