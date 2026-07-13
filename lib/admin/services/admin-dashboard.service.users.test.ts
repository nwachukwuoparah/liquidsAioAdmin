import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAdminUsers } from "@/lib/admin/services/admin-dashboard.service";

const { getMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: getMock,
    },
}));

describe("fetchAdminUsers", () => {
    beforeEach(() => {
        getMock.mockReset();
        getMock.mockResolvedValue({
            body: {
                status: "success",
                data: { users: [] },
            },
        });
    });

    it("forwards account type and search query params to GET /users", async () => {
        await fetchAdminUsers({
            accountType: "buyer",
            search: "nkume",
        });

        expect(getMock).toHaveBeenCalledWith("/users", {
            accountType: "buyer",
            search: "nkume",
        });
    });
});
