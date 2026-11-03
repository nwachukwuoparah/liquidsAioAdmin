import { describe, expect, it } from "vitest";
import { GET } from "./route";
import { PATCH as holdPATCH } from "./payment-hold/route";
import { PATCH as releasePATCH } from "./payment-hold/release/route";

describe("GET /v1/orders/admin/{orderId}", () => {
    it("returns order detail for the requested orderId", async () => {
        const req = new Request("http://localhost:3000/api/v1/orders/admin/ORD-2024-001");
        const res = await GET(req, { params: Promise.resolve({ orderId: "ORD-2024-001" }) });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.status).toBe("success");
        expect(json.data.orderSummary.orderId).toBe("#ORD-2024-001");
        expect(json.data.buyer.name).toBe("John Peters");
        expect(json.data.seller.name).toBe("Savannah Cornor");
        expect(json.data.paymentSummary.amount).toBe(9000);
        expect(json.data.shippingInformation.carrier).toBe("FedEx Freight");
    });

    it("reflects placed payment hold and releases it properly", async () => {
        const orderId = "ORD-2024-999";
        // 1. Place hold
        const holdReq = new Request(`http://localhost:3000/api/v1/orders/admin/${orderId}/payment-hold`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Under investigation by admin" }),
        });
        await holdPATCH(holdReq, { params: Promise.resolve({ orderId }) });

        // 2. Fetch order detail
        const getReq = new Request(`http://localhost:3000/api/v1/orders/admin/${orderId}`);
        const getRes = await GET(getReq, { params: Promise.resolve({ orderId }) });
        const getJson = await getRes.json();

        expect(getJson.data.paymentSummary.payoutStatus).toBe("On hold");
        expect(getJson.data.paymentSummary.payoutHold).toEqual(
            expect.objectContaining({ reason: "Under investigation by admin" }),
        );

        // 3. Release hold
        const releaseReq = new Request(`http://localhost:3000/api/v1/orders/admin/${orderId}/payment-hold/release`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Investigation cleared" }),
        });
        await releasePATCH(releaseReq, { params: Promise.resolve({ orderId }) });

        // 4. Fetch order detail again
        const getRes2 = await GET(getReq, { params: Promise.resolve({ orderId }) });
        const getJson2 = await getRes2.json();

        expect(getJson2.data.paymentSummary.payoutStatus).toBe("In Escrow");
        expect(getJson2.data.paymentSummary.payoutHold).toBeNull();
    });
});
