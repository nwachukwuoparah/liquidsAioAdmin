export type LotStatusStyle = {
    text: string;
    bg: string;
    label: string;
};

export function getLotStatusStyles(status: string): LotStatusStyle {
    switch (status.toLowerCase()) {
        case "active":
            return { text: "!text-[#00A341]", bg: "bg-[#00A34114]", label: "Active" };
        case "pending":
            return { text: "!text-[#DC6803]", bg: "bg-[#DC680314]", label: "Pending" };
        case "declined":
            return { text: "!text-[#CC2929]", bg: "bg-[#CC292914]", label: "Declined" };
        case "suspended":
            return { text: "!text-[#CC2929]", bg: "bg-[#CC292914]", label: "Suspended" };
        case "out-of-stock":
            return { text: "!text-[#0B0E05]", bg: "bg-[#0B0E050A]", label: "Out-of-Stock" };
        default:
            return { text: "!text-[#0B0E05CC]", bg: "bg-[#0B0E050A]", label: status };
    }
}
