import { describe, expect, it } from "vitest";
import { PATCH } from "./route";

describe("PATCH /v1/orders/admin/{orderId}/payment-hold/release", () => {
    it("releases payment hold with reason and returns 200", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin/ord-123/payment-hold/release", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Dispute resolved by buyer" }),
        });

        const res = await PATCH(req, { params: Promise.resolve({ orderId: "ord-123" }) });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.status).toBe("success");
        expect(json.data.orderId).toBe("ord-123");
        expect(json.data.reason).toBe("Dispute resolved by buyer");
        expect(json.data.released).toBe(true);
    });
});
