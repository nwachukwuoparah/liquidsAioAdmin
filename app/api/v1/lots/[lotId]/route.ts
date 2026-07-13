import { buildSampleAdminApiSuccessResponse, sampleAdminApiDelay } from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_INVENTORY_LOTS } from "@/lib/admin/mock-data/sample-admin-data";

const LOT_CATEGORY_TO_CODE: Record<string, string> = {
    Electronics: "elt",
    "Apparel & Footwear": "afw",
    "Home & Kitchen": "hkn",
    "Health & Beauty": "hby",
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

function buildSampleLotDetail(lotIdentifier: string) {
    const lot =
        SAMPLE_ADMIN_INVENTORY_LOTS.find((entry) => {
            const numericId = entry.id.replace(/\.$/, "");
            const slug = toSampleSlug(entry.title);
            return numericId === lotIdentifier || slug === lotIdentifier;
        }) ??
        SAMPLE_ADMIN_INVENTORY_LOTS[0];
    const numericId = lot.id.replace(/\.$/, "");
    const slug = toSampleSlug(lot.title);
    const price = Number(lot.price.replace(/[^0-9.]/g, "")) || 0;

    return {
        id: numericId,
        slug,
        title: lot.title,
        description:
            "This lot includes a mix of consumer electronics in retail-ready packaging. Ideal for resellers looking for fast-moving inventory.",
        category: LOT_CATEGORY_TO_CODE[lot.cat] ?? "elt",
        condition: lot.cond.toLowerCase(),
        skuType: "single_sku",
        unitQuantity: lot.qty,
        minimumOrderQuantity: 10,
        pricePerUnit: price / Math.max(lot.qty, 1),
        totalPrice: price,
        reviewStatus: STATUS_TO_REVIEW_STATUS[lot.status] ?? "pending",
        createdAt: "2026-07-07T10:00:00.000Z",
        updatedAt: "2026-07-08T13:00:00.000Z",
        views: 507,
        offers: 13,
        totalOrders: 2,
        listingUrl: lot.status === "Active" ? `https://liquidsaio.com/lots/${numericId}` : undefined,
        shippingFrom: "Dallas, TX 75240",
        shippingTerms: "Buyer arranged shipping",
        shippingFeeEstimate: "—",
        reported: Boolean(lot.alert),
        images: [
            { url: "https://images.unsplash.com/photo-1585386959984-a41552231653?w=240", position: 0 },
            { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=240", position: 1 },
            { url: "https://images.unsplash.com/photo-1505744386214-a9625e37e987?w=240", position: 2 },
            { url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=240", position: 3 },
            { url: "https://images.unsplash.com/photo-1546866135-1956790dd132?w=240", position: 4 },
            { url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=240", position: 5 },
        ],
        creator: {
            id: "seller-1",
            firstName: lot.seller.split(" ")[0],
            lastName: lot.seller.split(" ").slice(1).join(" "),
            email: `${lot.seller.replace(/\s+/g, "").toLowerCase()}@email.com`,
            phone: "+1 (555) 123-4567",
            profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120",
            rating: 4.8,
            accountHealth: 99,
            responseTime: "< 2 hours",
            activeListings: 47,
            joinedAt: "2024-01-15T00:00:00.000Z",
            location: "123 Business Ave, New York, NY 10001",
        },
    };
}

export async function GET(
    _request: Request,
    context: { params: Promise<{ lotId: string }> },
) {
    await sampleAdminApiDelay();
    const { lotId: lotIdentifier } = await context.params;

    return buildSampleAdminApiSuccessResponse({
        lot: buildSampleLotDetail(lotIdentifier),
    });
}
