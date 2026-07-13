import type {
    AdminInventoryLotDetailApiRecord,
    AdminInventoryLotDetailRecord,
    AdminInventoryLotSellerRecord,
} from "@/lib/inventory/types/admin-inventory-detail.types";
import { INVENTORY_CATEGORY_CODE_TO_LABEL } from "@/lib/inventory/constants/admin-inventory-api.constant";

function resolveReviewStatus(record: AdminInventoryLotDetailApiRecord): string {
    return (record.reviewStatus ?? record.review_status ?? "pending").toLowerCase();
}

function resolveUnitQuantity(record: AdminInventoryLotDetailApiRecord): number {
    return record.unitQuantity ?? record.unit_quantity ?? 0;
}

function resolveMinimumOrderQuantity(record: AdminInventoryLotDetailApiRecord): number {
    return record.minimumOrderQuantity ?? record.minimum_order_quantity ?? 0;
}

function resolvePricePerUnit(record: AdminInventoryLotDetailApiRecord): number {
    return Number(record.pricePerUnit ?? record.price_per_unit ?? record.price ?? 0);
}

function resolveTotalPrice(record: AdminInventoryLotDetailApiRecord, unitQuantity: number, pricePerUnit: number): number {
    const explicitTotal = record.totalPrice ?? record.total_price;

    if (explicitTotal != null && !Number.isNaN(Number(explicitTotal))) {
        return Number(explicitTotal);
    }

    return unitQuantity * pricePerUnit;
}

function resolveDisplayStatus(record: AdminInventoryLotDetailApiRecord): string {
    const unitQuantity = resolveUnitQuantity(record);
    const minimumOrderQuantity = resolveMinimumOrderQuantity(record);

    if (minimumOrderQuantity > 0 && unitQuantity < minimumOrderQuantity) {
        return "Out-of-stock";
    }

    switch (resolveReviewStatus(record)) {
        case "approved":
            return "Active";
        case "rejected":
            return "Declined";
        case "suspended":
            return "Suspended";
        case "in_review":
        case "pending":
        default:
            return "Pending";
    }
}

function resolveCategoryLabel(category?: string): string {
    if (!category) {
        return "—";
    }

    return INVENTORY_CATEGORY_CODE_TO_LABEL[category.toLowerCase()] ?? category;
}

function formatConditionLabel(condition?: string): string {
    if (!condition) {
        return "—";
    }

    return condition
        .split(/[\s_-]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function resolveSeller(record: AdminInventoryLotDetailApiRecord): AdminInventoryLotSellerRecord | undefined {
    return record.creator ?? record.seller;
}

function resolveSellerName(seller?: AdminInventoryLotSellerRecord): string {
    if (!seller) {
        return "—";
    }

    const fullName = [seller.firstName, seller.lastName].filter(Boolean).join(" ").trim();
    return fullName || seller.businessName?.trim() || "—";
}

function resolveReported(record: AdminInventoryLotDetailApiRecord): boolean {
    return Boolean(record.reported ?? record.isReported ?? record.is_reported);
}

/** Maps a backend lot detail payload into the admin modal shape. */
export function mapAdminInventoryLotDetailApiRecord(
    record: AdminInventoryLotDetailApiRecord,
): AdminInventoryLotDetailRecord {
    const unitQuantity = resolveUnitQuantity(record);
    const pricePerUnit = resolvePricePerUnit(record);
    const seller = resolveSeller(record);
    const sortedImages = [...(record.images ?? [])].sort(
        (left, right) => (left.position ?? 0) - (right.position ?? 0),
    );

    return {
        id: record.id,
        title: record.title?.trim() || "—",
        description: record.description?.trim() || "—",
        status: resolveDisplayStatus(record),
        reviewStatus: resolveReviewStatus(record),
        category: resolveCategoryLabel(record.category),
        condition: formatConditionLabel(record.condition),
        skuType: record.skuType ?? record.sku_type ?? "Single SKU",
        unitQuantity,
        pricePerUnit,
        totalPrice: resolveTotalPrice(record, unitQuantity, pricePerUnit),
        minimumOrderQuantity: resolveMinimumOrderQuantity(record),
        shippingFrom: record.shippingFrom ?? record.shipping_from ?? "—",
        shippingTerms: record.shippingTerms ?? record.shipping_terms ?? "—",
        shippingFeeEstimate: record.shippingFeeEstimate ?? record.shipping_fee_estimate ?? "—",
        createdAt: record.createdAt ?? record.created_at,
        updatedAt: record.updatedAt ?? record.updated_at,
        views: record.views ?? 0,
        offers: record.offers ?? 0,
        totalOrders: record.totalOrders ?? record.total_orders ?? 0,
        listingUrl: record.listingUrl ?? record.listing_url,
        reported: resolveReported(record),
        images: sortedImages.filter((image) => image.url?.trim()),
        seller: {
            id: seller?.id,
            name: resolveSellerName(seller),
            email: seller?.email?.trim() || "—",
            phone: seller?.phone?.trim() || "—",
            profileImageUrl: seller?.profileImageUrl ?? seller?.profilePicture,
            rating: seller?.rating ?? seller?.averageRating,
            accountHealth: seller?.accountHealth,
            responseTime: seller?.responseTime ?? "—",
            activeListings: seller?.activeListings,
            joinedAt: seller?.joinedAt ?? seller?.createdAt,
            location: seller?.location ?? seller?.addressText ?? "—",
        },
    };
}

/** Whether approve/decline actions should be shown for the lot status. */
export function canReviewInventoryLot(detail: Pick<AdminInventoryLotDetailRecord, "reviewStatus" | "status">): boolean {
    const reviewStatus = detail.reviewStatus.toLowerCase();
    return reviewStatus === "pending" || reviewStatus === "in_review" || detail.status === "Pending";
}

/** Whether suspend should be shown (active or reported lots). */
export function canSuspendInventoryLot(
    detail: Pick<AdminInventoryLotDetailRecord, "status" | "reported">,
): boolean {
    return detail.status === "Active" || detail.reported;
}

/** Whether the public listing link should be shown. */
export function canViewLiveInventoryListing(
    detail: Pick<AdminInventoryLotDetailRecord, "reviewStatus" | "status" | "listingUrl">,
): boolean {
    const reviewStatus = detail.reviewStatus.toLowerCase();
    return Boolean(detail.listingUrl) && (reviewStatus === "approved" || detail.status === "Active");
}
