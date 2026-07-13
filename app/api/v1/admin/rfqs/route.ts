import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_RFQS } from "@/lib/admin/mock-data/sample-admin-data";

export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const statusParam = searchParams.get("status") ?? "pending";
    const status = statusParam.toLowerCase() === "resolved" ? "resolved" : "pending";

    const rfqs = SAMPLE_ADMIN_RFQS.filter((rfq) => rfq.status === status);

    return buildSampleAdminApiSuccessResponse({
        totalCount: status === "pending" ? SAMPLE_ADMIN_RFQ_TAB_COUNTS.pending : SAMPLE_ADMIN_RFQ_TAB_COUNTS.resolved,
        results: rfqs,
        hasNext: false,
        nextCursor: null,
    });
}
