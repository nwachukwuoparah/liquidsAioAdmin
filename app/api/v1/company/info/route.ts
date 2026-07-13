import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_SETTINGS_GENERAL } from "@/lib/admin/mock-data/sample-admin-data";

/** Sample GET /company/info matching the backend singleton company info endpoint. */
export async function GET() {
    await sampleAdminApiDelay();
    return buildSampleAdminApiSuccessResponse(SAMPLE_ADMIN_SETTINGS_GENERAL);
}
