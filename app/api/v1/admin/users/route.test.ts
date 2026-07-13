import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/v1/admin/users/route";

describe("GET /api/v1/admin/users", () => {
    it("filters sample users by search when accountType is provided", async () => {
        const response = await GET(
            new Request("http://localhost/api/v1/admin/users?accountType=buyer&search=john"),
        );
        const body = await response.json();

        expect(body.status).toBe("success");
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);
        expect(
            body.data.every(
                (user: { name: string; email: string }) =>
                    user.name.toLowerCase().includes("john") ||
                    user.email.toLowerCase().includes("john"),
            ),
        ).toBe(true);
    });
});
