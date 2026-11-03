import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { saveMockRefund } from "@/lib/orders/mock-data/mock-payment-holds-store";

/**
 * Handles POST /v1/orders/admin/{orderId}/refund
 * Admin-only: Starts a full buyer refund for a successful payment.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> | { orderId: string } },
) {
    await sampleAdminApiDelay();
    const { orderId } = await Promise.resolve(params);

    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const reason = body.reason || "";

    const refund = saveMockRefund(orderId, reason);

    return buildSampleAdminApiSuccessResponse(
        {
            orderId,
            reason: refund.reason,
            refundedAt: refund.refundedAt,
            status: "refund_queued",
        },
        "full refund queued or already in progress",
    );
}
