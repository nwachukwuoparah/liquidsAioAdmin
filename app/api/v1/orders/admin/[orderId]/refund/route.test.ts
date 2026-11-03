import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /v1/orders/admin/{orderId}/refund route", () => {
    it("handles refund with orderId and reason", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin/ORD-123/refund", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Customer requested cancellation" }),
        });

        const res = await POST(req, { params: Promise.resolve({ orderId: "ORD-123" }) });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.status).toBe("success");
        expect(json.message).toBe("full refund queued or already in progress");
        expect(json.data.orderId).toBe("ORD-123");
        expect(json.data.reason).toBe("Customer requested cancellation");
        expect(json.data.status).toBe("refund_queued");
    });

    it("handles empty body gracefully", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin/ORD-456/refund", {
            method: "POST",
        });

        const res = await POST(req, { params: { orderId: "ORD-456" } });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.data.orderId).toBe("ORD-456");
        expect(json.data.reason).toBe("");
    });
});
