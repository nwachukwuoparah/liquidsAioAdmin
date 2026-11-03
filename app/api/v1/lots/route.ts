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
    "General Merchandise": "gml",
    "Toys & Baby": "tby",
};

const LOT_CONDITION_TO_VALUE: Record<string, string> = {
    New: "new",
    Refurbished: "refurbished",
    Mixed: "mixed",
    Overstock: "overstock",
};

const STATUS_TO_REVIEW_STATUS: Record<string, string> = {
    Active: "approved",
    Pending: "pending",
    "In review": "in_review",
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
    const deletedLots = searchParams.get("deleted_lots") === "true";
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const createdBy = searchParams.get("created_by") || searchParams.get("createdBy") || searchParams.get("seller_id") || searchParams.get("sellerId");
    const draftId = searchParams.get("draft_id") || searchParams.get("draftId");
    const countOnly = searchParams.get("count_only") === "true";
    const minPrice = Number(searchParams.get("min_price"));
    const maxPrice = Number(searchParams.get("max_price"));
    const moq = Number(searchParams.get("moq"));
    const sellerRating = Number(searchParams.get("seller_rating"));
    const sort = searchParams.get("sort") || "date";
    const order = searchParams.get("order") || "desc";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? 25));

    let lots = SAMPLE_ADMIN_INVENTORY_LOTS.map((lot, idx) => {
        const sellerParts = lot.seller.split(" ");
        const firstName = sellerParts[0] || "";
        const lastName = sellerParts.slice(1).join(" ") || "";
        const sellerId = `seller-${firstName.toLowerCase()}`;

        return {
            id: lot.id.replace(/\.$/, ""),
            slug: toSampleSlug(lot.title),
            title: lot.title,
            category: LOT_CATEGORY_TO_CODE[lot.cat] ?? "elt",
            condition: LOT_CONDITION_TO_VALUE[lot.cond] ?? lot.cond.toLowerCase(),
            unitQuantity: lot.qty,
            minimumOrderQuantity: 10,
            price: Number(lot.price.replace(/[^0-9.]/g, "")) || 0,
            reviewStatus: STATUS_TO_REVIEW_STATUS[lot.status] ?? "pending",
            createdAt: `2026-07-0${(idx % 9) + 1}T12:00:00.000Z`,
            createdBy: sellerId,
            draftId: null as string | null,
            sellerRating: 4.8,
            creator: {
                id: sellerId,
                pid: sellerId,
                firstName,
                lastName,
                businessName: lot.seller,
            },
            reported: Boolean(lot.alert),
        };
    });

    if (createdBy) {
        lots = lots.filter(
            (lot) =>
                lot.createdBy.toLowerCase() === createdBy.toLowerCase() ||
                lot.creator.id.toLowerCase() === createdBy.toLowerCase() ||
                lot.creator.pid.toLowerCase() === createdBy.toLowerCase() ||
                `${lot.creator.firstName} ${lot.creator.lastName}`.toLowerCase().includes(createdBy.toLowerCase()),
        );
    }

    if (draftId) {
        lots = lots.filter((lot) => lot.draftId === draftId);
    } else {
        lots = lots.filter((lot) => lot.draftId === null);
    }

    if (reviewStatus) {
        lots = lots.filter((lot) => lot.reviewStatus === reviewStatus);
    }

    if (reportedLots) {
        lots = lots.filter((lot) => lot.reported);
    }

    if (category) {
        const categories = category.split(",").map((c) => c.trim().toLowerCase());
        lots = lots.filter((lot) => categories.includes(lot.category.toLowerCase()));
    }

    if (condition) {
        const conditions = condition.split(",").map((c) => c.trim().toLowerCase());
        lots = lots.filter((lot) => conditions.includes(lot.condition.toLowerCase()));
    }

    if (!Number.isNaN(minPrice) && minPrice > 0) {
        lots = lots.filter((lot) => lot.price >= minPrice);
    }

    if (!Number.isNaN(maxPrice) && maxPrice > 0) {
        lots = lots.filter((lot) => lot.price <= maxPrice);
    }

    if (!Number.isNaN(moq) && moq > 0) {
        lots = lots.filter((lot) => lot.minimumOrderQuantity >= moq);
    }

    if (!Number.isNaN(sellerRating) && sellerRating > 0) {
        lots = lots.filter((lot) => lot.sellerRating >= sellerRating);
    }

    if (search) {
        lots = lots.filter(
            (lot) =>
                lot.title.toLowerCase().includes(search) ||
                `${lot.creator.firstName} ${lot.creator.lastName}`.toLowerCase().includes(search),
        );
    }

    if (sort === "price") {
        lots.sort((a, b) => (order === "asc" ? a.price - b.price : b.price - a.price));
    } else if (sort === "quantity") {
        lots.sort((a, b) => (order === "asc" ? a.unitQuantity - b.unitQuantity : b.unitQuantity - a.unitQuantity));
    }

    if (countOnly) {
        return buildSampleAdminApiSuccessResponse({
            count: lots.length,
        });
    }

    const startIndex = (page - 1) * limit;
    const paginatedLots = lots.slice(startIndex, startIndex + limit);

    return buildSampleAdminApiSuccessResponse({
        lots: paginatedLots,
        count: lots.length,
    });
}
