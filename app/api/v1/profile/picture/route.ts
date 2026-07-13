import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

/** Sample POST /profile/picture. */
export async function POST(request: Request) {
    await sampleAdminApiDelay();
    const body = (await request.json().catch(() => null)) as { profilePicture?: string } | null;

    return buildSampleAdminApiSuccessResponse({
        profilePicture: body?.profilePicture ?? null,
    });
}

/** Sample DELETE /profile/picture. */
export async function DELETE() {
    await sampleAdminApiDelay();
    return buildSampleAdminApiSuccessResponse({
        profilePicture: null,
    });
}
