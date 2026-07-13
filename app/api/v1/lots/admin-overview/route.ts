function getDefaultRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousEnd = new Date(start);
    previousEnd.setMilliseconds(-1);
    const previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
        previousStart: previousStart.toISOString(),
        previousEnd: previousEnd.toISOString(),
    };
}

/** Sample lots admin-overview endpoint matching /v1/lots/admin-overview. */
export async function GET_STATS(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const defaultRange = getDefaultRange();

    return buildSampleAdminApiSuccessResponse({
        range: {
            start: searchParams.get("start") ?? defaultRange.start,
            end: searchParams.get("end") ?? defaultRange.end,
        },
        previousRange: {
            start: defaultRange.previousStart,
            end: defaultRange.previousEnd,
        },
        stats: {
            allListings: { count: 34276, delta: 145 },
            activeListings: { count: 2245, delta: 23 },
            declinedListings: { count: 89, delta: -6 },
            suspendedListings: { count: 97, delta: 6 },
        },
    });
}
import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";

function getDefaultMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousEnd = new Date(start);
    previousEnd.setMilliseconds(-1);
    const previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
        previousStart: previousStart.toISOString(),
        previousEnd: previousEnd.toISOString(),
    };
}

/** Sample lots admin-overview endpoint matching /v1/lots/admin-overview. */
export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const defaultRange = getDefaultMonthRange();

    return buildSampleAdminApiSuccessResponse({
        range: {
            start: searchParams.get("start") ?? defaultRange.start,
            end: searchParams.get("end") ?? defaultRange.end,
        },
        previousRange: {
            start: defaultRange.previousStart,
            end: defaultRange.previousEnd,
        },
        stats: {
            allListings: { count: 34276, delta: 145 },
            activeListings: { count: 2245, delta: 23 },
            declinedListings: { count: 89, delta: -6 },
            suspendedListings: { count: 97, delta: 6 },
        },
    });
}
