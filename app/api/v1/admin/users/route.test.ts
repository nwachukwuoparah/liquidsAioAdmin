import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/v1/admin/users/route";

describe("GET /api/v1/admin/users", () => {
    it("filters sample users by search when accountType is provided", async () => {
        const response = await GET(
            new Request("http://localhost/api/v1/admin/users?accountType=buyer&search=john"),
        );
        const body = await response.json();

        expect(body.status).toBe("success");
        const users = Array.isArray(body.data) ? body.data : body.data?.users;
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        expect(
            users.every(
                (user: { name: string; email: string }) =>
                    user.name.toLowerCase().includes("john") ||
                    user.email.toLowerCase().includes("john"),
            ),
        ).toBe(true);
    });

    it("filters sample users by q query parameter", async () => {
        const response = await GET(
            new Request("http://localhost/api/v1/admin/users?accountType=buyer&q=john"),
        );
        const body = await response.json();

        expect(body.status).toBe("success");
        const users = Array.isArray(body.data) ? body.data : body.data?.users;
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
    });
});
