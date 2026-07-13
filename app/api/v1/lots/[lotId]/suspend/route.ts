import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

export async function POST(
    request: Request,
    context: { params: Promise<{ lotId: string }> },
) {
    await sampleAdminApiDelay(300);
    const { lotId } = await context.params;
    const requestBody = (await request.json().catch(() => ({}))) as {
        reason?: string;
    };

    return buildSampleAdminApiSuccessResponse(
        {
            lotId,
            action: "suspend",
            reason: requestBody.reason,
            processed: true,
        },
        "Listing suspended.",
    );
}
