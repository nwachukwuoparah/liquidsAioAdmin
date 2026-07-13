import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { getSampleComplianceDetail } from "@/lib/compliance/mock-data/sample-compliance-detail-data";
import type { AdminComplianceAssignRequestBody } from "@/lib/compliance/types/admin-compliance-detail.types";

interface RouteContext {
    params: Promise<{ reviewId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
    await sampleAdminApiDelay();
    const { reviewId } = await context.params;

    return buildSampleAdminApiSuccessResponse(getSampleComplianceDetail(reviewId));
}

export async function PATCH(request: Request, context: RouteContext) {
    await sampleAdminApiDelay(200);
    const { reviewId } = await context.params;
    const requestBody = (await request.json()) as AdminComplianceAssignRequestBody;

    return buildSampleAdminApiSuccessResponse(
        { reviewId, assignedTo: requestBody.assignedTo },
        "Assignee updated.",
    );
}
