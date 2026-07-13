import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_ORDERS } from "@/lib/admin/mock-data/sample-admin-data";

export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const tab = searchParams.get("tab") ?? "All";
    const search = searchParams.get("search")?.toLowerCase();

    let orders = SAMPLE_ADMIN_ORDERS;

    if (tab !== "All") {
        orders = orders.filter((order) => {
            if (tab === "Active orders") {
                return ["Awaiting shipment", "In-transit"].includes(order.orderStatus);
            }

            if (tab === "Completed") {
                return order.orderStatus === "Order completed";
            }

            if (tab === "Dispute / Refunds") {
                return ["Dispute", "Refunded"].includes(order.payStatus) || order.orderStatus === "Dispute";
            }

            if (tab === "Cancelled") {
                return order.orderStatus === "Cancelled";
            }

            return true;
        });
    }

    if (search) {
        orders = orders.filter(
            (order) =>
                order.title.toLowerCase().includes(search) ||
                order.buyer.toLowerCase().includes(search) ||
                order.seller.toLowerCase().includes(search),
        );
    }

    return buildSampleAdminApiSuccessResponse(orders);
}
