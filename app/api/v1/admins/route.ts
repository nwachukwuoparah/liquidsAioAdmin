import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

export async function GET() {
    await sampleAdminApiDelay(250);

    return buildSampleAdminApiSuccessResponse(
        {
            results: 3,
            hasNext: false,
            nextCursor: null,
            admins: [
                {
                    id: "admin-1",
                    firstName: "Samuel",
                    lastName: "Nathaniel",
                    email: "samuel@liquidsaio.com",
                    roles: [{ name: "superAdmin" }],
                    lastActive: new Date(Date.now() - 2 * 60_000).toISOString(),
                    status: "active",
                    revoked: false,
                },
                {
                    id: "admin-2",
                    firstName: "Jenny",
                    lastName: "Wilson",
                    email: "jenny@liquidsaio.com",
                    roles: [{ name: "admin" }],
                    lastActive: new Date(Date.now() - 60_000).toISOString(),
                    status: "active",
                    revoked: false,
                },
                {
                    id: "admin-3",
                    firstName: "Sarah",
                    lastName: "Chen",
                    email: "sarah@liquidsaio.com",
                    roles: [{ name: "admin" }],
                    lastActive: null,
                    status: "pending",
                    revoked: false,
                },
            ],
        },
        "Admin team members fetched.",
    );
}
