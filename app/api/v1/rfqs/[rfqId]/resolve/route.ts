import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

export async function POST(
    _request: Request,
    context: { params: Promise<{ rfqId: string }> },
) {
    await sampleAdminApiDelay(300);
    const { rfqId } = await context.params;

    return buildSampleAdminApiSuccessResponse(
        { rfqId, action: "resolve", processed: true },
        "Request marked as resolved.",
    );
}
