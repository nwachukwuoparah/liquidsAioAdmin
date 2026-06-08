export type TeamMemberStatus = "Active" | "Pending";

export function getMemberStatusStyles(status: TeamMemberStatus): string {
    return status === "Active"
        ? "bg-[#00A34114] text-[#00A341]"
        : "bg-[#DC680314] text-[#DC6803]";
}
