import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import type { AdminOrderApiRecord } from "@/lib/orders/types/admin-orders-api.types";

const MOCK_ADMIN_ORDERS: AdminOrderApiRecord[] = [
    {
        id: "d4b00001-1111-4000-8000-000000000001",
        order_id: "#ORD-2024-001",
        lot: {
            id: "lot-1",
            title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers",
            thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-1", name: "Savannah Nguyen" },
        buyer: { id: "user-2", name: "John Peters" },
        amount: 9000,
        payment_status: "processing", // In Escrow
        order_status: "active", // Awaiting shipment
        created_at: "2025-07-05T14:32:00.000Z",
        alert: false,
    },
    {
        id: "d4b00002-2222-4000-8000-000000000002",
        order_id: "#ORD-2024-002",
        lot: {
            id: "lot-2",
            title: "Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)",
            thumbnailUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-3", name: "Ronald Richards" },
        buyer: { id: "user-4", name: "Wade Warren" },
        amount: 1500,
        payment_status: "succeeded", // Released
        order_status: "active", // Awaiting shipment
        created_at: "2025-07-04T09:15:00.000Z",
        alert: true,
    },
    {
        id: "d4b00003-3333-4000-8000-000000000003",
        order_id: "#ORD-2024-003",
        lot: {
            id: "lot-3",
            title: "Kitchenware Overstock – 2 Pallets (Cookware & Utensils)",
            thumbnailUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-5", name: "Robert Fox" },
        buyer: { id: "user-6", name: "Kathryn Murphy" },
        amount: 800,
        payment_status: "succeeded", // Released
        order_status: "active", // In-transit
        created_at: "2025-07-03T18:40:00.000Z",
        alert: false,
    },
    {
        id: "d4b00004-4444-4000-8000-000000000004",
        order_id: "#ORD-2024-004",
        lot: {
            id: "lot-4",
            title: "Beauty & Cosmetics Lot – 500 Units",
            thumbnailUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-7", name: "Marvin McKinney" },
        buyer: { id: "user-3", name: "Ronald Richards" },
        amount: 1200,
        payment_status: "processing", // In Escrow
        order_status: "active", // Awaiting shipment
        created_at: "2025-07-05T11:20:00.000Z",
        alert: false,
    },
    {
        id: "d4b00005-5555-4000-8000-000000000005",
        order_id: "#ORD-2024-005",
        lot: {
            id: "lot-5",
            title: "Baby Products Pallet – Diapers, Toys, Accessories",
            thumbnailUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-8", name: "John stockton" },
        buyer: { id: "user-9", name: "Cameron Williamson" },
        amount: 950,
        payment_status: "succeeded", // Released
        order_status: "completed", // Delivered
        created_at: "2025-07-05T08:00:00.000Z",
        alert: false,
    },
    {
        id: "d4b00006-6666-4000-8000-000000000006",
        order_id: "#ORD-2024-006",
        lot: {
            id: "lot-6",
            title: "Automotive Accessories – 150 Mixed Items",
            thumbnailUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-9", name: "Cameron Williamson" },
        buyer: { id: "user-7", name: "Marvin McKinney" },
        amount: 1700,
        payment_status: "processing", // In Escrow
        order_status: "dispute_or_refunded", // Dispute
        created_at: "2025-07-05T13:10:00.000Z",
        alert: true,
    },
    {
        id: "d4b00007-7777-4000-8000-000000000007",
        order_id: "#ORD-2024-007",
        lot: {
            id: "lot-7",
            title: "Grocery Shelf Pulls – Snacks & Beverages",
            thumbnailUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-4", name: "Wade Warren" },
        buyer: { id: "user-5", name: "Robert Fox" },
        amount: 600,
        payment_status: "canceled", // Refunded
        order_status: "cancelled", // Cancelled
        created_at: "2025-07-05T07:45:00.000Z",
        alert: true,
    },
    {
        id: "d4b00008-8888-4000-8000-000000000008",
        order_id: "#ORD-2024-008",
        lot: {
            id: "lot-8",
            title: "Office Supplies Pallet – Printers, Paper, Toners",
            thumbnailUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-6", name: "Kathryn Murphy" },
        buyer: { id: "user-1", name: "Savannah Nguyen" },
        amount: 1100,
        payment_status: "canceled", // Refunded
        order_status: "completed", // Order completed
        created_at: "2025-07-05T16:00:00.000Z",
        alert: true,
    },
    {
        id: "d4b00009-9999-4000-8000-000000000009",
        order_id: "#ORD-2024-009",
        lot: {
            id: "lot-9",
            title: "Smart Home Devices Pallet – Sensors, Hubs, Cameras",
            thumbnailUrl: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-1", name: "Savannah Nguyen" },
        buyer: { id: "user-8", name: "John stockton" },
        amount: 4500,
        payment_status: "succeeded",
        order_status: "completed",
        created_at: "2025-07-02T12:00:00.000Z",
        alert: false,
    },
    {
        id: "d4b00010-aaaa-4000-8000-000000000010",
        order_id: "#ORD-2024-010",
        lot: {
            id: "lot-10",
            title: "Designer Footwear Pallet – Sneakers & Boots",
            thumbnailUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-3", name: "Ronald Richards" },
        buyer: { id: "user-6", name: "Kathryn Murphy" },
        amount: 2800,
        payment_status: "processing",
        order_status: "active",
        created_at: "2025-07-01T15:30:00.000Z",
        alert: false,
    },
    {
        id: "d4b00011-bbbb-4000-8000-000000000011",
        order_id: "#ORD-2024-011",
        lot: {
            id: "lot-11",
            title: "Garden Tools & Outdoor Furniture Lot",
            thumbnailUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-5", name: "Robert Fox" },
        buyer: { id: "user-2", name: "John Peters" },
        amount: 3200,
        payment_status: "processing",
        order_status: "dispute_or_refunded",
        created_at: "2025-06-30T10:00:00.000Z",
        alert: true,
    },
    {
        id: "d4b00012-cccc-4000-8000-000000000012",
        order_id: "#ORD-2024-012",
        lot: {
            id: "lot-12",
            title: "Commercial Grade Coffee Machines & Grinders",
            thumbnailUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=80&auto=format&fit=crop&q=60",
        },
        seller: { id: "user-7", name: "Marvin McKinney" },
        buyer: { id: "user-4", name: "Wade Warren" },
        amount: 6400,
        payment_status: "succeeded",
        order_status: "completed",
        created_at: "2025-06-28T14:15:00.000Z",
        alert: false,
    },
];

/**
 * Handles GET /v1/orders/admin cursor-paginated endpoint.
 */
export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);

    const cursorId = searchParams.get("cursor_id") || undefined;
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || "25")));
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const q = searchParams.get("q")?.trim().toLowerCase();
    const orderStatus = searchParams.get("order_status");
    const paymentStatus = searchParams.get("payment_status");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let filtered = [...MOCK_ADMIN_ORDERS];

    // Status filter
    if (orderStatus) {
        filtered = filtered.filter((item) => {
            const status = item.order_status?.toLowerCase();
            return status === orderStatus.toLowerCase();
        });
    }

    // Payment status filter
    if (paymentStatus) {
        filtered = filtered.filter((item) => {
            const payStatus = item.payment_status?.toLowerCase();
            return payStatus === paymentStatus.toLowerCase();
        });
    }

    // Date range filter
    if (start) {
        const startTime = new Date(start).getTime();
        filtered = filtered.filter((item) => {
            const itemTime = item.created_at ? new Date(item.created_at).getTime() : 0;
            return itemTime >= startTime;
        });
    }
    if (end) {
        const endTime = new Date(end).getTime();
        filtered = filtered.filter((item) => {
            const itemTime = item.created_at ? new Date(item.created_at).getTime() : 0;
            return itemTime <= endTime;
        });
    }

    // Search query with prefix rank prioritization
    if (q) {
        type RankedItem = { item: AdminOrderApiRecord; rank: number };
        const ranked: RankedItem[] = [];

        for (const item of filtered) {
            const orderIdStr = (item.order_id || "").toLowerCase();
            const titleStr = (item.lot?.title || item.title || "").toLowerCase();
            const sellerStr = (typeof item.seller === "string" ? item.seller : item.seller?.name || "").toLowerCase();
            const buyerStr = (typeof item.buyer === "string" ? item.buyer : item.buyer?.name || "").toLowerCase();

            const isPrefix =
                orderIdStr.startsWith(q) ||
                orderIdStr.replace(/^#/, "").startsWith(q) ||
                titleStr.startsWith(q) ||
                sellerStr.startsWith(q) ||
                buyerStr.startsWith(q);

            const isSubstring =
                orderIdStr.includes(q) ||
                titleStr.includes(q) ||
                sellerStr.includes(q) ||
                buyerStr.includes(q);

            if (isPrefix) {
                ranked.push({ item, rank: 0 });
            } else if (isSubstring) {
                ranked.push({ item, rank: 1 });
            }
        }

        // Rank 0 first, then rank 1
        ranked.sort((a, b) => a.rank - b.rank);
        filtered = ranked.map((r) => r.item);
    } else {
        // Sort by created_at according to `order` parameter
        filtered.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return order === "asc" ? timeA - timeB : timeB - timeA;
        });
    }

    const totalCount = 3598; // Realistic platform total matching screenshot: "Showing 1-20 of 3,598 results"

    // Cursor pagination slice
    let startIndex = 0;
    if (cursorId) {
        const foundIndex = filtered.findIndex((item) => item.id === cursorId);
        if (foundIndex !== -1) {
            startIndex = foundIndex + 1;
        }
    }

    const pagedItems = filtered.slice(startIndex, startIndex + limit);
    const hasNext = startIndex + limit < filtered.length;
    const lastItem = pagedItems[pagedItems.length - 1];

    const nextCursor =
        hasNext && lastItem
            ? {
                  cursor_id: lastItem.id,
                  cursor_sort_at: lastItem.created_at,
                  cursor_search_rank: q ? 1 : 0,
              }
            : null;

    return buildSampleAdminApiSuccessResponse({
        orders: pagedItems,
        totalCount: q || orderStatus || paymentStatus ? filtered.length : totalCount,
        hasNext,
        nextCursor,
    });
}
