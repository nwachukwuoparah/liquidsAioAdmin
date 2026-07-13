import { beforeEach, describe, expect, it } from "vitest";
import {
    clearAllCookiesForTests,
    deleteCookieValue,
    getCookieValue,
    setCookieValue,
} from "@/lib/helpers/cookie-storage";

describe("cookie-storage", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
    });

    it("stores and reads cookie values", () => {
        setCookieValue("test_cookie", "cookie-value", { maxAgeSeconds: 3600 });

        expect(getCookieValue("test_cookie")).toBe("cookie-value");
    });

    it("deletes cookie values", () => {
        setCookieValue("test_cookie", "cookie-value", { maxAgeSeconds: 3600 });

        deleteCookieValue("test_cookie");

        expect(getCookieValue("test_cookie")).toBeNull();
    });
});
