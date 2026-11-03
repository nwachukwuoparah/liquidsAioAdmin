export type StatusStyle = {
    text: string;
    bg: string;
    label: string;
};

export function getOrderStatusStyles(status: string): StatusStyle {
    switch (status.toLowerCase()) {
        case "order completed":
        case "completed":
            return { text: "!text-[#518300]", bg: "bg-[#B1EC521A]", label: "Order completed" };
        case "delivered":
            return { text: "!text-[#4F46E5]", bg: "bg-[#4F46E514]", label: "Delivered" };
        case "awaiting shipment / in-transit":
        case "awaiting_shipment / in_transit":
        case "active orders":
        case "awaiting shipment":
        case "awaiting_shipment":
        case "active":
            return {
                text: "!text-[#0B0E05]",
                bg: "bg-[#0B0E050A]",
                label:
                    status.toLowerCase() === "active"
                        ? "Active"
                        : status.toLowerCase().includes("awaiting shipment / in-transit")
                          ? "Awaiting shipment / In-transit"
                          : "Awaiting shipment",
            };
        case "in-transit":
        case "in_transit":
            return { text: "!text-[#DC6803]", bg: "bg-[#DC680314]", label: "In-transit" };
        case "cancelled":
        case "canceled":
            return { text: "!text-[#CC2929]", bg: "bg-[#CC292914]", label: "Cancelled" };
        case "dispute":
        case "disputed":
        case "dispute_or_refunded":
            return { text: "!text-[#CC2929]", bg: "bg-[#CC292914]", label: "Dispute" };
        default:
            return { text: "!text-[#0B0E05CC]", bg: "bg-[#0B0E050A]", label: status };
    }
}

export function getPaymentStatusStyles(status: string): StatusStyle {
    switch (status.toLowerCase()) {
        case "released":
        case "succeeded":
            return { text: "!text-[#00A341]", bg: "bg-[#00A34114]", label: "Released" };
        case "pending":
        case "in escrow":
        case "in_escrow":
        case "processing":
        case "requires_capture":
        case "requires_action":
        case "requires_confirmation":
        case "requires_payment_method":
            return { text: "!text-[#DC6803]", bg: "bg-[#DC680314]", label: "Pending" };
        case "refunded":
        case "canceled":
        case "cancelled":
            return { text: "!text-[#0B0E05]", bg: "bg-[#0B0E050A]", label: "Refunded" };
        default:
            return { text: "!text-[#0B0E05CC]", bg: "bg-[#0B0E050A]", label: status };
    }
}
