import { beforeEach, describe, expect, it, vi } from "vitest";
import { replaceBrowserHistoryRoute } from "@/lib/auth/utilities/replace-browser-history-route";

describe("replaceBrowserHistoryRoute", () => {
    beforeEach(() => {
        vi.stubGlobal("location", { replace: vi.fn() });
    });

    it("replaces the current history entry with the target route", () => {
        replaceBrowserHistoryRoute("/setup-2fa?token=abc");

        expect(window.location.replace).toHaveBeenCalledWith("/setup-2fa?token=abc");
    });
});
