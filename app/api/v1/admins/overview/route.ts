import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

export async function GET() {
    await sampleAdminApiDelay(250);

    return buildSampleAdminApiSuccessResponse(
        {
            activeMembers: 3,
            pendingInvites: 2,
            revokedAdmins: 0,
        },
        "Admin overview counts fetched.",
    );
}
