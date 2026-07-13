import { describe, expect, it } from "vitest";
import { parseAdminUsersResponse } from "./parse-admin-users-response";

describe("parseAdminUsersResponse", () => {
    it("parses wrapped users payloads with totalCount", () => {
        const page = parseAdminUsersResponse({
            status: "success",
            data: {
                users: [{ id: "1", name: "Jane" }],
                totalCount: 42,
            },
        });

        expect(page.users).toHaveLength(1);
        expect(page.totalCount).toBe(42);
    });

    it("falls back to users length when totalCount is missing", () => {
        const page = parseAdminUsersResponse({
            status: "success",
            data: {
                users: [{ id: "1" }, { id: "2" }],
            },
        });

        expect(page.totalCount).toBe(2);
    });

    it("parses legacy array payloads", () => {
        const page = parseAdminUsersResponse({
            status: "success",
            data: [{ id: "1" }, { id: "2" }, { id: "3" }],
        });

        expect(page.users).toHaveLength(3);
        expect(page.totalCount).toBe(3);
    });

    it("accepts total_count aliases", () => {
        const page = parseAdminUsersResponse({
            status: "success",
            data: {
                users: [],
                total_count: 18,
            },
        });

        expect(page.totalCount).toBe(18);
    });
});
