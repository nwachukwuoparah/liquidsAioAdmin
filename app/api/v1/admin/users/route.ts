import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import {
    SAMPLE_ADMIN_USERS,
    SAMPLE_ADMIN_USER_TAB_COUNTS,
} from "@/lib/admin/mock-data/sample-admin-data";

export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const accountType = searchParams.get("accountType");
    const segmentParam = searchParams.get("segment");
    const segment =
        segmentParam ??
        (accountType === "seller"
            ? "sellers"
            : accountType === "reported"
              ? "reported"
              : "buyers");
    const search = searchParams.get("search")?.toLowerCase();
    const limit = Number(searchParams.get("limit") ?? "0");

    let users = SAMPLE_ADMIN_USERS.filter((user) => user.segment === segment);

    if (search) {
        users = users.filter(
            (user) =>
                user.name.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search) ||
                user.location.toLowerCase().includes(search),
        );
    }

    const totalCount =
        segment === "sellers"
            ? SAMPLE_ADMIN_USER_TAB_COUNTS.sellers
            : segment === "reported"
              ? SAMPLE_ADMIN_USER_TAB_COUNTS.reported
              : SAMPLE_ADMIN_USER_TAB_COUNTS.buyers;

    const pagedUsers = limit > 0 ? users.slice(0, limit) : users;

    return buildSampleAdminApiSuccessResponse({
        users: pagedUsers,
        totalCount,
    });
}
