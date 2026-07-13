import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import {
    SAMPLE_ADMIN_SETTINGS_PROFILE,
} from "@/lib/admin/mock-data/sample-admin-data";
import type { AdminSettingsProfileRequestBody } from "@/lib/admin/types/admin-api.types";

export async function GET() {
    await sampleAdminApiDelay();
    return buildSampleAdminApiSuccessResponse(SAMPLE_ADMIN_SETTINGS_PROFILE);
}

export async function POST(request: Request) {
    await sampleAdminApiDelay(300);
    const requestBody = (await request.json()) as AdminSettingsProfileRequestBody;

    return buildSampleAdminApiSuccessResponse(
        {
            ...SAMPLE_ADMIN_SETTINGS_PROFILE,
            ...requestBody,
        },
        "Profile settings updated.",
    );
}
