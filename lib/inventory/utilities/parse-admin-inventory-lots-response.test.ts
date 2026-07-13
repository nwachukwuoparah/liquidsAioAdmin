import { describe, expect, it } from "vitest";
import { parseAdminInventoryLotsResponse } from "./parse-admin-inventory-lots-response";

describe("parseAdminInventoryLotsResponse", () => {
    it("parses wrapped success payloads with lots", () => {
        const page = parseAdminInventoryLotsResponse(
            {
                status: "success",
                data: {
                    lots: [{ id: "lot-1" }, { id: "lot-2" }],
                    count: 42,
                },
            },
            25,
        );

        expect(page.lots).toHaveLength(2);
        expect(page.count).toBe(42);
        expect(page.hasNext).toBe(false);
    });

    it("sets hasNext when lots length equals limit", () => {
        const page = parseAdminInventoryLotsResponse(
            {
                status: "success",
                data: {
                    lots: Array.from({ length: 25 }, (_, index) => ({ id: `lot-${index}` })),
                },
            },
            25,
        );

        expect(page.hasNext).toBe(true);
    });

    it("parses count-only payloads", () => {
        const page = parseAdminInventoryLotsResponse(
            {
                status: "success",
                data: { count: 12 },
            },
            25,
        );

        expect(page.lots).toEqual([]);
        expect(page.count).toBe(12);
        expect(page.hasNext).toBe(false);
    });

    it("parses totalCount aliases when count is missing", () => {
        const page = parseAdminInventoryLotsResponse(
            {
                status: "success",
                data: {
                    lots: [{ id: "lot-1" }],
                    totalCount: 48,
                },
            },
            25,
        );

        expect(page.count).toBe(48);
    });
});
