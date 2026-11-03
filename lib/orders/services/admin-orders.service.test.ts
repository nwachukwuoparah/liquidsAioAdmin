import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    buildAdminOrdersQueryParams,
    fetchAdminOrdersPage,
    fetchAdminOrdersList,
    fetchAdminOrderDetail,
    holdAdminOrderPayment,
    refundAdminOrderBuyer,
    releaseAdminOrderPaymentHold,
} from "./admin-orders.service";

const { getMock, patchMock, postMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
    patchMock: vi.fn(),
    postMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: getMock,
        patch: patchMock,
        post: postMock,
    },
}));

describe("buildAdminOrdersQueryParams", () => {
    it("builds query params matching GET /v1/orders/admin specification", () => {
        const params = buildAdminOrdersQueryParams({
            tab: "Active orders",
            limit: 10,
            q: "headphones",
            order: "asc",
            cursor_id: "uuid-123",
            cursor_sort_at: "2025-07-05T00:00:00.000Z",
            cursor_search_rank: 0,
            payment_status: "processing",
            start: "2025-07-01T00:00:00.000Z",
            end: "2025-07-31T23:59:59.999Z",
        });

        expect(params).toEqual({
            cursor_id: "uuid-123",
            cursor_sort_at: "2025-07-05T00:00:00.000Z",
            cursor_search_rank: "0",
            limit: "10",
            order: "asc",
            q: "headphones",
            order_status: "active",
            payment_status: "processing",
            start: "2025-07-01T00:00:00.000Z",
            end: "2025-07-31T23:59:59.999Z",
        });
    });

    it("applies defaults for sort order and limit", () => {
        const params = buildAdminOrdersQueryParams({});

        expect(params.limit).toBe("25");
        expect(params.order).toBe("desc");
        expect(params.order_status).toBeUndefined();
        expect(params.q).toBeUndefined();
    });

    it("maps UI tabs to order_status properly", () => {
        expect(buildAdminOrdersQueryParams({ tab: "All" }).order_status).toBeUndefined();
        expect(buildAdminOrdersQueryParams({ tab: "Active orders" }).order_status).toBe("active");
        expect(buildAdminOrdersQueryParams({ tab: "Completed" }).order_status).toBe("completed");
        expect(buildAdminOrdersQueryParams({ tab: "Dispute / Refunds" }).order_status).toBe("dispute_or_refunded");
        expect(buildAdminOrdersQueryParams({ tab: "Cancelled" }).order_status).toBe("cancelled");
    });
});

describe("fetchAdminOrdersPage", () => {
    beforeEach(() => {
        getMock.mockReset();
        patchMock.mockReset();
    });

    it("fetches orders from /orders/admin and returns mapped page", async () => {
        getMock.mockResolvedValueOnce({
            body: {
                status: "success",
                data: {
                    orders: [
                        {
                            id: "order-1",
                            order_id: "#ORD-2024-001",
                            lot: {
                                id: "lot-1",
                                title: "Mixed Electronics Pallet",
                                thumbnailUrl: "https://example.com/item.jpg",
                            },
                            seller: { name: "Savannah Nguyen" },
                            buyer: { name: "John Peters" },
                            amount: 9000,
                            payment_status: "processing",
                            order_status: "active",
                            created_at: "2025-07-05T12:00:00.000Z",
                            alert: false,
                        },
                    ],
                    totalCount: 3598,
                    hasNext: true,
                    nextCursor: {
                        cursor_id: "order-1",
                        cursor_sort_at: "2025-07-05T12:00:00.000Z",
                        cursor_search_rank: 0,
                    },
                },
            },
        });

        const result = await fetchAdminOrdersPage({ tab: "Active orders", limit: 10 }, 0);

        expect(getMock).toHaveBeenCalledWith("/orders/admin", expect.objectContaining({
            limit: "10",
            order_status: "active",
        }));

        expect(result.totalCount).toBe(3598);
        expect(result.hasNext).toBe(true);
        expect(result.orders).toHaveLength(1);
        expect(result.orders[0]).toEqual(expect.objectContaining({
            id: "1.",
            orderId: "#ORD-2024-001",
            title: "Mixed Electronics Pallet",
            seller: "Savannah Nguyen",
            buyer: "John Peters",
            amount: "$9,000",
            payStatus: "Pending",
            orderStatus: "Awaiting shipment",
            thumbnailUrl: "https://example.com/item.jpg",
            alert: false,
        }));
    });

    it("fetchAdminOrdersList returns orders list", async () => {
        getMock.mockResolvedValueOnce({
            body: {
                data: {
                    orders: [
                        {
                            id: "order-2",
                            order_id: "#ORD-2024-002",
                            title: "Branded Apparel",
                            seller: "Ronald Richards",
                            buyer: "Wade Warren",
                            amount: 1500,
                            payStatus: "Released",
                            orderStatus: "Awaiting shipment",
                            alert: true,
                        },
                    ],
                    totalCount: 1,
                    hasNext: false,
                },
            },
        });

        const list = await fetchAdminOrdersList({});
        expect(list).toHaveLength(1);
        expect(list[0].title).toBe("Branded Apparel");
        expect(list[0].alert).toBe(true);
    });

    it("returns empty page when dispute_or_refunded is not implemented on backend", async () => {
        getMock.mockRejectedValueOnce(new Error("500 Internal Server Error: dispute_or_refunded not implemented"));

        const page = await fetchAdminOrdersPage({ tab: "Dispute / Refunds" });
        expect(page).toEqual({
            orders: [],
            totalCount: 0,
            nextCursor: null,
            hasNext: false,
        });
    });

    it("holdAdminOrderPayment calls PATCH /orders/admin/{orderId}/payment-hold", async () => {
        patchMock.mockResolvedValueOnce({ body: { status: "success" } });

        await holdAdminOrderPayment("#ORD-2024-001", { reason: "Damaged freight" });

        expect(patchMock).toHaveBeenCalledWith(
            "/orders/admin/ORD-2024-001/payment-hold",
            { reason: "Damaged freight" },
        );
    });

    it("releaseAdminOrderPaymentHold calls PATCH /orders/admin/{orderId}/payment-hold/release", async () => {
        patchMock.mockResolvedValueOnce({ body: { status: "success" } });

        await releaseAdminOrderPaymentHold("#ORD-2024-001", { reason: "Inspection passed" });

        expect(patchMock).toHaveBeenCalledWith(
            "/orders/admin/ORD-2024-001/payment-hold/release",
            { reason: "Inspection passed" },
        );
    });

    it("refundAdminOrderBuyer calls POST /orders/admin/{orderId}/refund", async () => {
        postMock.mockResolvedValueOnce({ body: { status: "success" } });

        await refundAdminOrderBuyer("#ORD-2024-001", { reason: "Goods never arrived" });

        expect(postMock).toHaveBeenCalledWith(
            "/orders/admin/ORD-2024-001/refund",
            { reason: "Goods never arrived" },
        );
    });

    it("fetchAdminOrderDetail queries order detail by ID", async () => {
        getMock.mockResolvedValueOnce({
            body: {
                data: {
                    orderSummary: { orderId: "ORD_Tw0B-m4Kx-zlp8", orderStatus: "Awaiting shipment" },
                    paymentSummary: { amount: 1200, payoutStatus: "Released" },
                },
            },
        });

        const detail = await fetchAdminOrderDetail("ORD_Tw0B-m4Kx-zlp8");
        expect(getMock).toHaveBeenCalledWith("/orders/admin/ORD_Tw0B-m4Kx-zlp8");
        expect(detail.orderId).toBe("#ORD_Tw0B-m4Kx-zlp8");
    });

    it("fetchAdminOrderDetail tries order ID first and uses UUID if order ID is not working", async () => {
        const uuid = "01a05cde-24d0-710e-b1da-10933e594efb";
        const publicId = "ORD_Tw0B-m4Kx-zlp8";

        // First call with order ID fails with 500 error
        getMock.mockRejectedValueOnce(new Error("500 Internal Server Error"));
        // Fallback call with UUID succeeds
        getMock.mockResolvedValueOnce({
            body: {
                data: {
                    orderSummary: { orderId: publicId, orderStatus: "Awaiting shipment" },
                    paymentSummary: { amount: 1200, payoutStatus: "Released" },
                },
            },
        });

        const detail = await fetchAdminOrderDetail(publicId, uuid);
        expect(getMock).toHaveBeenNthCalledWith(1, `/orders/admin/${publicId}`);
        expect(getMock).toHaveBeenNthCalledWith(2, `/orders/admin/${uuid}`);
        expect(detail.orderId).toBe("#ORD_Tw0B-m4Kx-zlp8");
    });
});
