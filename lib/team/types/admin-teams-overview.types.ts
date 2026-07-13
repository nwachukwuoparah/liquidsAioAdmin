/** Normalized Teams & permission overview metric counts. */
export interface AdminTeamsOverviewCounts {
    activeMembers: number;
    pendingInvites: number;
    revokedAdmins: number;
}

/** Raw API payload for GET /admins/overview. */
export interface AdminTeamsOverviewApiPayload {
    activeMembers?: number;
    pendingInvites?: number;
    revokedAdmins?: number;
    active_members?: number;
    pending_invites?: number;
    revoked_admins?: number;
}
