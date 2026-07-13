import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

export async function POST(
    _request: Request,
    context: { params: Promise<{ lotId: string }> },
) {
    await sampleAdminApiDelay(300);
    const { lotId } = await context.params;

    return buildSampleAdminApiSuccessResponse(
        { lotId, action: "approve", processed: true },
        "Listing approved.",
    );
}
