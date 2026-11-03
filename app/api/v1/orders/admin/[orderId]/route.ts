import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import {
    getMockPaymentHold,
    getMockRefund,
} from "@/lib/orders/mock-data/mock-payment-holds-store";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ orderId: string }> | { orderId: string } },
) {
    await sampleAdminApiDelay();
    const resolvedParams = await Promise.resolve(params);
    const orderId = decodeURIComponent(resolvedParams.orderId);
    const formattedId = orderId.startsWith("#") ? orderId : `#${orderId}`;

    const activeHold = getMockPaymentHold(orderId);
    const activeRefund = getMockRefund(orderId);

    return buildSampleAdminApiSuccessResponse({
        id: orderId,
        orderSummary: {
            id: orderId,
            orderId: formattedId,
            order_id: formattedId,
            orderStatus: activeRefund ? "Cancelled" : "Awaiting shipment",
            order_status: activeRefund ? "cancelled" : "active",
            quantity: 200,
            unit: "pallets",
            orderQuantity: "200 pallets",
            title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers",
        },
        paymentSummary: {
            paymentDate: "2025-07-05T14:00:00.000Z",
            amount: 9000,
            paymentAmount: "$9,000",
            shippingFee: 200,
            platformFee: 18,
            sellerNetPayout: 8782,
            payoutStatus: activeRefund
                ? "Refunded"
                : activeHold
                  ? "On hold"
                  : "In Escrow",
            payoutDate: null,
            payoutHold: activeHold
                ? {
                    reason: activeHold.reason,
                    heldAt: activeHold.heldAt,
                }
                : null,
        },
        shippingInformation: {
            carrier: "FedEx Freight",
            trackingNumber: "FDX789456123",
            shippedOn: "2025-11-05T12:44:00.000Z",
            deliveredOn: null,
        },
        shippingDetails: {
            status: "in_transit",
            timeline: [
                { stage: "preparing", title: "Preparing to ship", description: "Package is being prepared for shipping", completed: true },
                { stage: "in_transit", title: "In transit", description: "Your package is now being transported to your location.", current: true },
                { stage: "delivered", title: "Delivered", completed: false },
                { stage: "completed", title: "Order completed", completed: false },
            ],
        },
        buyer: {
            id: "user-2",
            name: "John Peters",
            phone: "+1 (555) 123-4567",
            email: "johnpeters@email.com",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        },
        seller: {
            id: "user-1",
            name: "Savannah Cornor",
            phone: "+1 (555) 321-4567",
            email: "savannahcornor@email.com",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        },
    });
}
