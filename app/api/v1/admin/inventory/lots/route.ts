import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_INVENTORY_LOTS } from "@/lib/admin/mock-data/sample-admin-data";

export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const tab = searchParams.get("tab") ?? "All Lots";
    const search = searchParams.get("search")?.toLowerCase();

    let lots = SAMPLE_ADMIN_INVENTORY_LOTS;

    if (tab === "Pending approval") {
        lots = lots.filter((lot) => lot.status === "Pending");
    } else if (tab === "Reported") {
        lots = lots.filter((lot) => lot.alert);
    } else if (tab === "Suspended") {
        lots = lots.filter((lot) => lot.status === "Suspended");
    }

    if (search) {
        lots = lots.filter(
            (lot) =>
                lot.title.toLowerCase().includes(search) ||
                lot.seller.toLowerCase().includes(search) ||
                lot.cat.toLowerCase().includes(search),
        );
    }

    return buildSampleAdminApiSuccessResponse(lots);
}
