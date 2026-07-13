import { buildSampleAdminApiSuccessResponse, sampleAdminApiDelay } from "@/lib/admin/utilities/sample-admin-api-route";
import {
    SAMPLE_ADMIN_INVENTORY_STATS,
    SAMPLE_ADMIN_INVENTORY_TAB_COUNTS,
} from "@/lib/admin/mock-data/sample-admin-data";

export async function GET() {
    await sampleAdminApiDelay();
    return buildSampleAdminApiSuccessResponse({
        stats: SAMPLE_ADMIN_INVENTORY_STATS,
        tabCounts: SAMPLE_ADMIN_INVENTORY_TAB_COUNTS,
    });
}
