/** Shared badge styles for All users account status and verification columns. */

const STATUS_BADGE_BASE = "inline-block rounded-full px-2.5 py-0.5 text-xs font-bold";

const ACCOUNT_STATUS_STYLES = {
    active: "bg-[#00A34114] text-[#00A341]",
    suspended: "bg-[#CC292914] text-[#CC2929]",
    pending: "bg-[#DC680314] text-[#DC6803]",
    reported: "bg-[#DC680314] text-[#DC6803]",
    default: "bg-[#0B0E050A] text-[#0B0E05A3]",
} as const;

const VERIFICATION_STATUS_STYLES = {
    approved: "bg-[#00A34114] text-[#00A341]",
    verified: "bg-[#00A34114] text-[#00A341]",
    pending: "bg-[#DC680314] text-[#DC6803]",
    "in review": "bg-[#0B0E050A] text-[#0B0E05A3]",
    in_review: "bg-[#0B0E050A] text-[#0B0E05A3]",
    "needs info": "bg-[#1A1AFF14] text-[#1A1AFF]",
    needs_info: "bg-[#1A1AFF14] text-[#1A1AFF]",
    rejected: "bg-[#CC292914] text-[#CC2929]",
    default: "bg-[#0B0E050A] text-[#0B0E05A3]",
} as const;

function normalizeStatusKey(status?: string | null): string {
    return status?.trim().toLowerCase().replace(/[_-]+/g, " ") ?? "";
}

/** Returns Tailwind classes for an account status badge (case-insensitive). */
export function getUserAccountStatusStyles(status?: string | null): string {
    const key = normalizeStatusKey(status);

    if (key === "active") {
        return `${STATUS_BADGE_BASE} ${ACCOUNT_STATUS_STYLES.active}`;
    }

    if (key === "suspended") {
        return `${STATUS_BADGE_BASE} ${ACCOUNT_STATUS_STYLES.suspended}`;
    }

    if (key === "pending" || key === "reported") {
        return `${STATUS_BADGE_BASE} ${ACCOUNT_STATUS_STYLES.pending}`;
    }

    return `${STATUS_BADGE_BASE} ${ACCOUNT_STATUS_STYLES.default}`;
}

/** Returns Tailwind classes for a verification / compliance review badge. */
export function getUserVerificationStatusStyles(status?: string | null): string {
    const key = normalizeStatusKey(status);

    if (key === "approved" || key === "verified") {
        return `${STATUS_BADGE_BASE} ${VERIFICATION_STATUS_STYLES.approved}`;
    }

    if (key === "pending") {
        return `${STATUS_BADGE_BASE} ${VERIFICATION_STATUS_STYLES.pending}`;
    }

    if (key === "in review") {
        return `${STATUS_BADGE_BASE} ${VERIFICATION_STATUS_STYLES["in review"]}`;
    }

    if (key === "needs info") {
        return `${STATUS_BADGE_BASE} ${VERIFICATION_STATUS_STYLES["needs info"]}`;
    }

    if (key === "rejected") {
        return `${STATUS_BADGE_BASE} ${VERIFICATION_STATUS_STYLES.rejected}`;
    }

    return `${STATUS_BADGE_BASE} ${VERIFICATION_STATUS_STYLES.default}`;
}
