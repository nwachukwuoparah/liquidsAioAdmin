import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_SETTINGS_GENERAL } from "@/lib/admin/mock-data/sample-admin-data";
import type { AdminSettingsGeneralRequestBody } from "@/lib/admin/types/admin-api.types";

/** Sample POST /settings/company-info matching the backend create company info endpoint. */
export async function POST(request: Request) {
    await sampleAdminApiDelay(300);
    const requestBody = (await request.json()) as AdminSettingsGeneralRequestBody;

    return buildSampleAdminApiSuccessResponse(
        {
            ...SAMPLE_ADMIN_SETTINGS_GENERAL,
            ...requestBody,
            phoneNumber: requestBody.phoneNumber ?? SAMPLE_ADMIN_SETTINGS_GENERAL.phoneNumber,
            phoneNumberCountryCode:
                requestBody.phoneNumberCountryCode ??
                SAMPLE_ADMIN_SETTINGS_GENERAL.phoneNumberCountryCode,
        },
        "Company info created.",
    );
}
