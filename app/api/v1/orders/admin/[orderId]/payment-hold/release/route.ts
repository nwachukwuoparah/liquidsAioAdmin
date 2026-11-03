import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { deleteMockPaymentHold } from "@/lib/orders/mock-data/mock-payment-holds-store";

/**
 * Handles PATCH /v1/orders/admin/{orderId}/payment-hold/release
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> | { orderId: string } },
) {
    await sampleAdminApiDelay();
    const { orderId } = await Promise.resolve(params);

    const body = (await request.json().catch(() => ({}))) as { reason?: string };

    deleteMockPaymentHold(orderId);

    return buildSampleAdminApiSuccessResponse(
        {
            orderId,
            reason: body.reason || "",
            released: true,
        },
        "payment hold released or already released",
    );
}
