import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import {
    getSampleAdminOverviewCharts,
    getSampleAdminOverviewDashboard,
    SAMPLE_ADMIN_RFQ_TAB_COUNTS,
} from "@/lib/admin/mock-data/sample-admin-data";

export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const period = searchParams.get("period") ?? "This month";

    return buildSampleAdminApiSuccessResponse({
        dashboard: getSampleAdminOverviewDashboard(),
        charts: getSampleAdminOverviewCharts(period),
        rfqTabCounts: SAMPLE_ADMIN_RFQ_TAB_COUNTS,
    });
}
