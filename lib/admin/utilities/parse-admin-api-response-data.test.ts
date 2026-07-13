import { describe, expect, it } from "vitest";
import { getAdminApiResponseMessage, parseAdminApiResponseData } from "./parse-admin-api-response-data";

describe("parseAdminApiResponseData", () => {
    it("returns nested data from a success wrapper", () => {
        expect(
            parseAdminApiResponseData<{ dashboard: { quickStats: [] } }>({
                status: "success",
                data: { dashboard: { quickStats: [] } },
            }),
        ).toEqual({ dashboard: { quickStats: [] } });
    });

    it("returns the payload as-is when it is already unwrapped", () => {
        expect(parseAdminApiResponseData({ pending: 3 })).toEqual({ pending: 3 });
    });
});

describe("getAdminApiResponseMessage", () => {
    it("returns the message from a success wrapper", () => {
        expect(
            getAdminApiResponseMessage(
                { status: "success", message: "General settings updated." },
                "Fallback",
            ),
        ).toBe("General settings updated.");
    });

    it("returns the fallback when no message is present", () => {
        expect(getAdminApiResponseMessage({ status: "success", data: {} }, "Fallback")).toBe("Fallback");
    });
});
