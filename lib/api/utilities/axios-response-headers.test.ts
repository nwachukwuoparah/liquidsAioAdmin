import { describe, expect, it } from "vitest";
import { AxiosHeaders } from "axios";
import { getAxiosResponseHeader } from "@/lib/api/utilities/axios-response-headers";

describe("getAxiosResponseHeader", () => {
    it("reads headers from AxiosHeaders using get()", () => {
        const headers = new AxiosHeaders({
            laioat: "header-access-token",
        });

        expect(
            getAxiosResponseHeader(
                {
                    headers,
                } as never,
                "laioat",
            ),
        ).toBe("header-access-token");
    });

    it("reads headers from a plain object with lowercase keys", () => {
        expect(
            getAxiosResponseHeader(
                {
                    headers: {
                        laioat: "plain-object-token",
                    },
                } as never,
                "laioat",
            ),
        ).toBe("plain-object-token");
    });
});
