import type { AdminComplianceApiCursor } from "@/lib/compliance/types/admin-compliance-api.types";

/** Nested person profile on audit log rows. */
export interface AdminComplianceAuditPartyApiRecord {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string | null;
}

/** Document snapshot nested in before/after payloads. */
export interface AdminComplianceAuditDocumentSnapshot {
    id?: string;
    type?: string;
    format?: string;
    status?: string;
    kycId?: string;
    kybId?: string;
    userId?: string;
    fileId?: string;
    fileUrl?: string;
    url?: string;
    filePath?: string;
    originalFilename?: string;
    originalFileName?: string;
    rejectionReason?: string | null;
    bytes?: number;
    createdAt?: string;
    updatedAt?: string;
}

/** Assignment snapshot nested in before/after payloads. */
export interface AdminComplianceAuditAssignmentSnapshot {
    id?: string;
    status?: string;
    userId?: string;
    assignedAdminId?: string | null;
    claimedAt?: string | null;
    completedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    assignedAdmin?: AdminComplianceAuditPartyApiRecord | null;
}

/** KYC/KYB entity snapshot nested in before/after payloads. */
export interface AdminComplianceAuditEntitySnapshot {
    id?: string;
    status?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: string;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    kycDocuments?: AdminComplianceAuditDocumentSnapshot[];
    kybDocuments?: AdminComplianceAuditDocumentSnapshot[];
}

/** beforeData / afterData payload on an audit log. */
export interface AdminComplianceAuditChangeData {
    kyc?: AdminComplianceAuditEntitySnapshot | null;
    kyb?: AdminComplianceAuditEntitySnapshot | null;
    document?: AdminComplianceAuditDocumentSnapshot | null;
    documents?: AdminComplianceAuditDocumentSnapshot[];
    assignment?: AdminComplianceAuditAssignmentSnapshot | null;
    complianceState?: {
        complianceReviewStatus?: string;
        complianceUpdatedAt?: string;
    } | null;
    metadata?: AdminComplianceAuditMetadata | null;
}

export interface AdminComplianceAuditMetadata {
    ip?: string;
    path?: string;
    method?: string;
    userAgent?: string;
}

/**
 * Raw audit-log row from GET /compliance/audit-logs.
 * Matches the network response under `data.auditLogs`.
 */
export interface AdminComplianceAuditLogApiRecord {
    id: string;
    targetUserId?: string | null;
    actorType?: string | null;
    actorAdminId?: string | null;
    actorUserId?: string | null;
    subjectType?: string | null;
    subjectId?: string | null;
    action?: string | null;
    beforeData?: AdminComplianceAuditChangeData | null;
    afterData?: AdminComplianceAuditChangeData | null;
    createdAt?: string | null;
    targetUser?: AdminComplianceAuditPartyApiRecord | null;
    actorAdmin?: AdminComplianceAuditPartyApiRecord | null;
    actorUser?: AdminComplianceAuditPartyApiRecord | null;
    document?: AdminComplianceAuditDocumentSnapshot | null;
    metadata?: AdminComplianceAuditMetadata | null;
    [key: string]: unknown;
}

export interface AdminComplianceAuditLogsPage {
    auditLogs: AdminComplianceAuditLogApiRecord[];
    hasNext: boolean;
    nextCursor?: AdminComplianceApiCursor | null;
}

export interface AdminComplianceAuditLogsResponseBody {
    status?: string;
    message?: string;
    data?: {
        auditLogs?: AdminComplianceAuditLogApiRecord[];
        results?: AdminComplianceAuditLogApiRecord[];
        hasNext?: boolean;
        nextCursor?: AdminComplianceApiCursor | null;
    };
    auditLogs?: AdminComplianceAuditLogApiRecord[];
    results?: AdminComplianceAuditLogApiRecord[];
    hasNext?: boolean;
    nextCursor?: AdminComplianceApiCursor | null;
}

export interface FetchAdminComplianceAuditLogsPageParams extends Record<string, string | undefined> {
    cursor_id?: string;
    cursor_sort_at?: string;
    limit?: string;
    admin_id?: string;
    action?: string;
    start?: string;
    end?: string;
}

export type AdminComplianceAuditActorType = "admin" | "user" | "unknown";

/** One labeled detail line rendered in the Details column. */
export interface AdminComplianceAuditDetailItem {
    label: string;
    value: string;
    tone?: "default" | "danger";
}

/** Previewable document linked to an audit event. */
export interface AdminComplianceAuditDocumentPreview {
    id: string;
    typeLabel: string;
    filename: string;
    format: string;
    status: string;
    /** Primary URL used for in-app <img> preview. */
    previewUrl: string;
    /** Alternate URL (often same as previewUrl). */
    openUrl: string;
    /** Ordered fallback URLs tried when the primary preview fails. */
    previewCandidates: string[];
    isImage: boolean;
}

/** Full API row plus display helpers used by the audit table. */
export interface AdminComplianceAuditLogRecord extends AdminComplianceAuditLogApiRecord {
    sn: string;
    createdAtLabel: string;
    createdAtExact: string;
    actionLabel: string;
    subject: string;
    subjectLabel: string;
    actorTypeLabel: string;
    actorName: string;
    actorEmail: string;
    actorAvatarUrl?: string;
    targetUserName: string;
    targetUserEmail: string;
    targetUserAvatarUrl?: string;
    statusBefore: string;
    statusAfter: string;
    rejectionReason: string;
    documentType: string;
    documentFilename: string;
    documentTypeLabel: string;
    documentCount: number;
    documents: AdminComplianceAuditDocumentPreview[];
    assignmentBefore: string;
    assignmentAfter: string;
    assigneeName: string;
    reviewedAtLabel: string;
    detailItems: AdminComplianceAuditDetailItem[];
    eventLabel: string;
    summary: string;
    narrative: string;
}
