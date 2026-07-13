import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";
import type {
    AdminTeamsOverviewApiPayload,
    AdminTeamsOverviewCounts,
} from "@/lib/team/types/admin-teams-overview.types";

function toCount(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

/** Parses GET /admins/overview into Active members / Pending invites counts. */
export function parseAdminTeamsOverviewResponse(body: unknown): AdminTeamsOverviewCounts {
    const payload = parseAdminApiResponseData<AdminTeamsOverviewApiPayload>(body);

    return {
        activeMembers: toCount(payload.activeMembers ?? payload.active_members),
        pendingInvites: toCount(payload.pendingInvites ?? payload.pending_invites),
        revokedAdmins: toCount(payload.revokedAdmins ?? payload.revoked_admins),
    };
}
