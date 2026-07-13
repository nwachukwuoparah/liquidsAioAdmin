import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

/** Sample GET /profile/picture/signed-upload. */
export async function GET() {
    await sampleAdminApiDelay();
    return buildSampleAdminApiSuccessResponse({
        payload: {
            timestamp: 1700000000,
            folder: "profiles/admin-sample",
            overwrite: true,
            invalidate: true,
            public_id: "profile-picture",
        },
        signature: "sample-signature",
        cloudname: "sample-cloud",
        apiKey: "sample-api-key",
        expiresIn: new Date(Date.now() + 21 * 60 * 1000).toISOString(),
    });
}
