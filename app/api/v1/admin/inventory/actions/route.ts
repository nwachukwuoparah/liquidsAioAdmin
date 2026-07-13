import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import type { AdminInventoryActionRequestBody } from "@/lib/admin/types/admin-api.types";

export async function POST(request: Request) {
    await sampleAdminApiDelay(300);
    const requestBody = (await request.json()) as AdminInventoryActionRequestBody;

    return buildSampleAdminApiSuccessResponse(
        { lotId: requestBody.lotId, action: requestBody.action, processed: true },
        `Lot ${requestBody.action} action queued.`,
    );
}
