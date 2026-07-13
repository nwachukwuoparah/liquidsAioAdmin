import type { AdminInventoryLotRecord } from "@/lib/admin/types/admin-api.types";
import {
    INVENTORY_CATEGORY_CODE_TO_LABEL,
} from "@/lib/inventory/constants/admin-inventory-api.constant";
import type {
    AdminInventoryLotApiRecord,
    AdminInventoryLotCreatorProfile,
} from "@/lib/inventory/types/admin-inventory-api.types";

const FALLBACK_BG_CLASSES = [
    "bg-amber-100",
    "bg-blue-100",
    "bg-red-100",
    "bg-purple-100",
    "bg-emerald-100",
    "bg-indigo-100",
] as const;

function resolveUnitQuantity(record: AdminInventoryLotApiRecord): number {
    return record.unitQuantity ?? record.unit_quantity ?? 0;
}

function resolveMinimumOrderQuantity(record: AdminInventoryLotApiRecord): number {
    return record.minimumOrderQuantity ?? record.minimum_order_quantity ?? 0;
}

function resolveReviewStatus(record: AdminInventoryLotApiRecord): string {
    return (record.reviewStatus ?? record.review_status ?? "pending").toLowerCase();
}

function resolveCreator(record: AdminInventoryLotApiRecord): AdminInventoryLotCreatorProfile | undefined {
    return record.creator ?? record.seller;
}

function resolveSellerName(record: AdminInventoryLotApiRecord): string {
    const creator = resolveCreator(record);

    if (!creator) {
        return "—";
    }

    const fullName = [creator.firstName, creator.lastName].filter(Boolean).join(" ").trim();

    return fullName || creator.businessName?.trim() || "—";
}

function resolveCategoryLabel(category?: string): string {
    if (!category) {
        return "—";
    }

    return INVENTORY_CATEGORY_CODE_TO_LABEL[category.toLowerCase()] ?? category;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);
}

function resolvePrice(record: AdminInventoryLotApiRecord): string {
    const price = record.price ?? record.pricePerUnit ?? record.price_per_unit;

    if (price == null || Number.isNaN(Number(price))) {
        return "—";
    }

    return formatCurrency(Number(price));
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

function formatDisplayDate(isoDate?: string): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}

function resolveCreatedAt(record: AdminInventoryLotApiRecord): string | undefined {
    return record.createdAt ?? record.created_at;
}

function resolveStatusLabel(record: AdminInventoryLotApiRecord): string {
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

function resolveImage(record: AdminInventoryLotApiRecord, index: number): string {
    const sortedImages = [...(record.images ?? [])].sort(
        (left, right) => (left.position ?? 0) - (right.position ?? 0),
    );
    const firstUrl = sortedImages.find((image) => image.url?.trim())?.url?.trim();

    if (firstUrl) {
        return firstUrl;
    }

    return FALLBACK_BG_CLASSES[index % FALLBACK_BG_CLASSES.length];
}

function resolveReported(record: AdminInventoryLotApiRecord): boolean {
    return Boolean(record.reported ?? record.isReported ?? record.is_reported);
}

/** Maps a backend lot record into the admin inventory table row shape. */
export function mapAdminInventoryLotApiRecord(
    record: AdminInventoryLotApiRecord,
    index: number,
): AdminInventoryLotRecord {
    return {
        id: record.id,
        slug: record.slug?.trim() || record.id,
        title: record.title?.trim() || "—",
        seller: resolveSellerName(record),
        cat: resolveCategoryLabel(record.category),
        qty: resolveUnitQuantity(record),
        price: resolvePrice(record),
        cond: formatConditionLabel(record.condition),
        date: formatDisplayDate(resolveCreatedAt(record)),
        status: resolveStatusLabel(record),
        img: resolveImage(record, index),
        alert: resolveReported(record) || undefined,
    };
}

/** Returns true when the lot image value is a remote URL. */
export function isLotImageUrl(imageValue: string): boolean {
    return imageValue.startsWith("http://") || imageValue.startsWith("https://");
}
