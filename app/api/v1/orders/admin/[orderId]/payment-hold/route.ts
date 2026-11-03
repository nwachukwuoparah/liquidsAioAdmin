import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { saveMockPaymentHold } from "@/lib/orders/mock-data/mock-payment-holds-store";

/**
 * Handles PATCH /v1/orders/admin/{orderId}/payment-hold
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> | { orderId: string } },
) {
    await sampleAdminApiDelay();
    const { orderId } = await Promise.resolve(params);

    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const reason = body.reason || "Payment hold placed by admin";

    const hold = saveMockPaymentHold(orderId, reason);

    return buildSampleAdminApiSuccessResponse(
        {
            orderId,
            reason: hold.reason,
            heldAt: hold.heldAt,
            held: true,
        },
        "payment hold created or already active",
    );
}
