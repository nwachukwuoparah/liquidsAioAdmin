import { beforeEach, describe, expect, it, vi } from "vitest";
import { CLIENT_DEVICE_NAME_FALLBACK } from "@/lib/api/constants/client-device.constant";
import { DEVICE_ID_STORAGE_KEY } from "@/lib/auth/constants/auth-api.constant";
import {
    getClientDeviceId,
    getClientDeviceName,
    getClientTimezone,
} from "@/lib/helpers/client-device";
import { clearAllCookiesForTests, getCookieValue } from "@/lib/helpers/cookie-storage";

describe("getClientDeviceId", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        vi.stubGlobal("crypto", { randomUUID: () => "generated-device-id" });
    });

    it("generates and persists a device id on first use", () => {
        expect(getClientDeviceId()).toBe("generated-device-id");
        expect(getCookieValue(DEVICE_ID_STORAGE_KEY)).toBe("generated-device-id");
    });

    it("reuses the persisted device id on subsequent calls", () => {
        getClientDeviceId();

        expect(getClientDeviceId()).toBe("generated-device-id");
    });
});

describe("getClientDeviceName", () => {
    it("returns a fallback when navigator is unavailable", () => {
        const originalNavigator = globalThis.navigator;

        vi.stubGlobal("navigator", undefined);

        expect(getClientDeviceName()).toBe(CLIENT_DEVICE_NAME_FALLBACK);

        vi.stubGlobal("navigator", originalNavigator);
    });

    it("derives a readable name from the user agent", () => {
        vi.stubGlobal("navigator", {
            userAgent:
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            platform: "MacIntel",
        });

        expect(getClientDeviceName()).toBe("Chrome on macOS");
    });
});

describe("getClientTimezone", () => {
    it("returns the runtime IANA timezone", () => {
        vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
            timeZone: "Africa/Lagos",
        } as Intl.ResolvedDateTimeFormatOptions);

        expect(getClientTimezone()).toBe("Africa/Lagos");
    });
});
