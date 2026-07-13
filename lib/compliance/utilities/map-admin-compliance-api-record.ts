import type { AdminComplianceReviewRecord } from "@/lib/admin/types/admin-api.types";
import type {
    AdminComplianceApiRecord,
    AdminComplianceAssigneeProfile,
} from "@/lib/compliance/types/admin-compliance-api.types";
import { getProfileDisplayName } from "@/lib/profile-avatar";

function resolveAccountType(record: AdminComplianceApiRecord): AdminComplianceReviewRecord["accountType"] {
    const accountType = (record.accountType ?? record.account_type ?? "").toLowerCase();
    return accountType === "seller" ? "Seller" : "Buyer";
}

function resolveReviewStatus(record: AdminComplianceApiRecord): AdminComplianceReviewRecord["reviewStatus"] {
    const status = (record.complianceReviewStatus ?? record.compliance_review_status ?? "pending").toLowerCase();

    switch (status) {
        case "in_review":
            return "In Review";
        case "approved":
            return "Approved";
        case "rejected":
            return "Rejected";
        default:
            return "Pending";
    }
}

function resolveAssigneeName(profile?: AdminComplianceAssigneeProfile): string {
    if (!profile) {
        return "";
    }

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    return fullName || profile.email?.trim() || "";
}

function resolveAssignedTo(record: AdminComplianceApiRecord): string {
    if (record.assignedTo?.trim()) {
        return record.assignedTo.trim();
    }

    const assignee =
        record.assignedReviewer ??
        record.assignee ??
        record.reviewAssignee;

    return resolveAssigneeName(assignee) || "—";
}

function resolveComplianceUpdatedAt(record: AdminComplianceApiRecord): string | undefined {
    return record.complianceUpdatedAt ?? record.compliance_updated_at;
}

function formatDisplayDate(isoDate?: string): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (parsedDate >= startOfToday) {
        return "Today";
    }

    if (parsedDate >= startOfYesterday) {
        return "Yesterday";
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** Maps a backend compliance user record into the admin table row shape. */
export function mapAdminComplianceApiRecord(
    record: AdminComplianceApiRecord,
    index: number,
): AdminComplianceReviewRecord {
    const email = record.email?.trim() ?? "";
    const firstName = record.firstName?.trim();
    const lastName = record.lastName?.trim();
    const name = getProfileDisplayName(firstName, lastName, email);

    return {
        id: record.id,
        sn: `${index + 1}.`,
        name,
        email,
        firstName,
        lastName,
        avatarUrl: record.profilePicture,
        accountType: resolveAccountType(record),
        dateSubmitted: formatDisplayDate(resolveComplianceUpdatedAt(record)),
        assignedTo: resolveAssignedTo(record),
        reviewStatus: resolveReviewStatus(record),
    };
}
