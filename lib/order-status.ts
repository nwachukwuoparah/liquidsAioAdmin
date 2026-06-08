export type StatusStyle = {
    text: string;
    bg: string;
    label: string;
};

export function getOrderStatusStyles(status: string): StatusStyle {
    switch (status.toLowerCase()) {
        case "order completed":
            return { text: "!text-[#518300]", bg: "bg-[#B1EC521A]", label: "Order completed" };
        case "delivered":
            return { text: "!text-[#00A341]", bg: "bg-[#00A34114]", label: "Delivered" };
        case "awaiting shipment":
            return { text: "!text-[#0B0E05]", bg: "bg-[#0B0E050A]", label: "Awaiting shipment" };
        case "in-transit":
            return { text: "!text-[#DC6803]", bg: "bg-[#DC680314]", label: "In-transit" };
        case "cancelled":
            return { text: "!text-[#CC2929]", bg: "bg-[#CC292914]", label: "Cancelled" };
        case "dispute":
            return { text: "!text-[#CC2929]", bg: "bg-[#CC292914]", label: "Dispute" };
        default:
            return { text: "!text-[#0B0E05CC]", bg: "bg-[#0B0E050A]", label: status };
    }
}

export function getPaymentStatusStyles(status: string): StatusStyle {
    switch (status.toLowerCase()) {
        case "released":
            return { text: "!text-[#00A341]", bg: "bg-[#00A34114]", label: "Released" };
        case "in escrow":
            return { text: "!text-[#DC6803]", bg: "bg-[#DC680314]", label: "In Escrow" };
        case "refunded":
            return { text: "!text-[#0B0E05]", bg: "bg-[#0B0E050A]", label: "Refunded" };
        default:
            return { text: "!text-[#0B0E05CC]", bg: "bg-[#0B0E050A]", label: status };
    }
}
