import { getInitialsFromName, getProfileDisplayName } from "@/lib/profile-avatar";
import type { TeamMemberStatus } from "@/lib/team-member-status";
import type { AdminTeamMemberApiRecord } from "@/lib/team/types/admin-team-members.types";

/** Display name from raw admin API fields. */
export function getTeamMemberDisplayName(member: AdminTeamMemberApiRecord): string {
    return getProfileDisplayName(member.firstName, member.lastName, member.email);
}

/** Avatar initials from raw admin API fields. */
export function getTeamMemberInitials(member: AdminTeamMemberApiRecord): string {
    return getInitialsFromName(getTeamMemberDisplayName(member));
}

/** First role name from the raw roles payload, unchanged. */
export function getTeamMemberRoleName(member: AdminTeamMemberApiRecord): string {
    const roles = member.roles;

    if (Array.isArray(roles)) {
        for (const role of roles) {
            if (typeof role === "string" && role.trim()) {
                return role;
            }

            if (
                typeof role === "object" &&
                role !== null &&
                typeof role.name === "string" &&
                role.name.trim()
            ) {
                return role.name;
            }
        }

        return "—";
    }

    if (typeof roles === "string" && roles.trim()) {
        return roles;
    }

    return "—";
}

/** Whether the raw admin record is revoked. */
export function isTeamMemberRevoked(member: AdminTeamMemberApiRecord): boolean {
    return member.revoked === true;
}

/** Whether the raw admin record is treated as an active member in the UI. */
export function isTeamMemberActive(member: AdminTeamMemberApiRecord): boolean {
    if (isTeamMemberRevoked(member)) {
        return false;
    }

    return member.status?.toLowerCase().trim() === "active";
}

/**
 * Status label for badges.
 * When `revoked` is true, always hardcodes "Revoked".
 */
export function getTeamMemberStatusLabel(member: AdminTeamMemberApiRecord): TeamMemberStatus {
    if (isTeamMemberRevoked(member)) {
        return "Revoked";
    }

    return isTeamMemberActive(member) ? "Active" : "Pending";
}
