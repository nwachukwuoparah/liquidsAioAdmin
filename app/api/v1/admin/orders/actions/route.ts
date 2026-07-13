import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import type { AdminOrderActionRequestBody } from "@/lib/admin/types/admin-api.types";

export async function POST(request: Request) {
    await sampleAdminApiDelay(300);
    const requestBody = (await request.json()) as AdminOrderActionRequestBody;

    return buildSampleAdminApiSuccessResponse(
        { orderId: requestBody.orderId, action: requestBody.action, processed: true },
        `Order ${requestBody.action.replace("_", " ")} action queued.`,
    );
}
