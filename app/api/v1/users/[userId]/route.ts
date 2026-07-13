import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

export async function GET(
    _request: Request,
    context: { params: Promise<{ userId: string }> },
) {
    await sampleAdminApiDelay(250);
    const { userId } = await context.params;

    return buildSampleAdminApiSuccessResponse(
        {
            user: {
                id: userId,
                firstName: "Samuel",
                lastName: "Nathaniel",
                email: "samuel@liquidsaio.com",
                phone: "212-456-7890",
                timezone: "gmt-05",
                profilePicture: null,
            },
        },
        "Admin user details fetched.",
    );
}
