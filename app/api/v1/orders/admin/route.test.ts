import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /v1/orders/admin route", () => {
    it("returns cursor-paginated orders list with default limit", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin");
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.status).toBe("success");
        expect(Array.isArray(data.data.orders)).toBe(true);
        expect(data.data.orders.length).toBeGreaterThan(0);
        expect(data.data.totalCount).toBe(3598);
    });

    it("filters orders by order_status", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin?order_status=active");
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.data.orders.every((o: { order_status: string }) => o.order_status === "active")).toBe(true);
    });

    it("filters orders by payment_status", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin?payment_status=processing");
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.data.orders.every((o: { payment_status: string }) => o.payment_status === "processing")).toBe(true);
    });

    it("searches with prefix priority", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin?q=Mixed");
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.data.orders.length).toBeGreaterThan(0);
        expect(data.data.orders[0].lot.title).toContain("Mixed");
    });

    it("respects limit and returns nextCursor if more items exist", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin?limit=2");
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.data.orders).toHaveLength(2);
        expect(data.data.hasNext).toBe(true);
        expect(data.data.nextCursor).toBeDefined();
        expect(data.data.nextCursor.cursor_id).toBe(data.data.orders[1].id);
    });
});
