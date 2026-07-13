import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import type { AdminLotReviewRequestBody } from "@/lib/inventory/types/admin-inventory-detail.types";

export async function POST(request: Request) {
    await sampleAdminApiDelay(300);
    const requestBody = (await request.json()) as AdminLotReviewRequestBody;

    const actionLabel =
        requestBody.action === "approve"
            ? "approved"
            : requestBody.action === "reject"
              ? "declined"
              : "suspended";

    return buildSampleAdminApiSuccessResponse(
        { lotId: requestBody.lotId, action: requestBody.action, processed: true },
        `Listing ${actionLabel}.`,
    );
}
