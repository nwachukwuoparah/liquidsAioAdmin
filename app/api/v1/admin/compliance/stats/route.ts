import { buildSampleAdminApiSuccessResponse, sampleAdminApiDelay } from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_COMPLIANCE_STATS } from "@/lib/admin/mock-data/sample-admin-data";

export async function GET() {
    await sampleAdminApiDelay();
    return buildSampleAdminApiSuccessResponse(SAMPLE_ADMIN_COMPLIANCE_STATS);
}
