export type TeamMemberStatus = "Active" | "Pending" | "Revoked";

export function getMemberStatusStyles(status: TeamMemberStatus): string {
    if (status === "Active") {
        return "bg-[#00A34114] text-[#00A341]";
    }

    if (status === "Revoked") {
        return "bg-[#D92D2014] text-[#D92D20]";
    }

    return "bg-[#DC680314] text-[#DC6803]";
}
