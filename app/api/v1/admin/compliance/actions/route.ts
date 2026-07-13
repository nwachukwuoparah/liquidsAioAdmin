import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import type { AdminComplianceActionRequestBody } from "@/lib/admin/types/admin-api.types";

export async function POST(request: Request) {
    await sampleAdminApiDelay(300);
    const requestBody = (await request.json()) as AdminComplianceActionRequestBody;

    return buildSampleAdminApiSuccessResponse(
        {
            reviewId: requestBody.reviewId,
            action: requestBody.action,
            documentId: requestBody.documentId,
            processed: true,
        },
        `Compliance ${requestBody.action.replace("_", " ")} action queued.`,
    );
}
