import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminApiBaseUrl } from "@/lib/admin/services/admin-api-client";

describe("getAdminApiBaseUrl", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("returns the configured base URL without a trailing slash", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/v1/");

        expect(getAdminApiBaseUrl()).toBe("https://api.example.com/v1");
    });

    it("returns undefined when the env var is not set", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

        expect(getAdminApiBaseUrl()).toBeUndefined();
    });
});
