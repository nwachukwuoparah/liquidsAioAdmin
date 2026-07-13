import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_INVENTORY_LOTS } from "@/lib/admin/mock-data/sample-admin-data";

const LOT_CATEGORY_TO_CODE: Record<string, string> = {
    Electronics: "elt",
    "Apparel & Footwear": "afw",
    "Home & Kitchen": "hkn",
    "Health & Beauty": "hby",
};

const LOT_CONDITION_TO_VALUE: Record<string, string> = {
    New: "new",
    Mixed: "mixed",
    Overstock: "overstock",
};

const STATUS_TO_REVIEW_STATUS: Record<string, string> = {
    Active: "approved",
    Pending: "pending",
    Declined: "rejected",
    Suspended: "suspended",
    "Out-of-stock": "approved",
};

function toSampleSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const search = searchParams.get("search")?.toLowerCase();
    const reviewStatus = searchParams.get("review_status");
    const reportedLots = searchParams.get("reported_lots") === "true";
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const minPrice = Number(searchParams.get("min_price"));
    const maxPrice = Number(searchParams.get("max_price"));
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? 25));

    let lots = SAMPLE_ADMIN_INVENTORY_LOTS.map((lot) => ({
        id: lot.id.replace(/\.$/, ""),
        slug: toSampleSlug(lot.title),
        title: lot.title,
        category: LOT_CATEGORY_TO_CODE[lot.cat] ?? "elt",
        condition: LOT_CONDITION_TO_VALUE[lot.cond] ?? lot.cond.toLowerCase(),
        unitQuantity: lot.qty,
        minimumOrderQuantity: 10,
        price: Number(lot.price.replace(/[^0-9.]/g, "")) || 0,
        reviewStatus: STATUS_TO_REVIEW_STATUS[lot.status] ?? "pending",
        createdAt: "2026-07-01T12:00:00.000Z",
        creator: {
            firstName: lot.seller.split(" ")[0],
            lastName: lot.seller.split(" ").slice(1).join(" "),
        },
        reported: Boolean(lot.alert),
    }));

    if (reviewStatus) {
        lots = lots.filter((lot) => lot.reviewStatus === reviewStatus);
    }

    if (reportedLots) {
        lots = lots.filter((lot) => lot.reported);
    }

    if (category) {
        lots = lots.filter((lot) => lot.category === category);
    }

    if (condition) {
        lots = lots.filter((lot) => lot.condition === condition);
    }

    if (!Number.isNaN(minPrice)) {
        lots = lots.filter((lot) => lot.price >= minPrice);
    }

    if (!Number.isNaN(maxPrice)) {
        lots = lots.filter((lot) => lot.price <= maxPrice);
    }

    if (search) {
        lots = lots.filter(
            (lot) =>
                lot.title.toLowerCase().includes(search) ||
                `${lot.creator.firstName} ${lot.creator.lastName}`.toLowerCase().includes(search),
        );
    }

    const startIndex = (page - 1) * limit;
    const paginatedLots = lots.slice(startIndex, startIndex + limit);

    return buildSampleAdminApiSuccessResponse({
        lots: paginatedLots,
        count: lots.length,
    });
}
