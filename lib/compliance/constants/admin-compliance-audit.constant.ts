/** Cursor page size for compliance audit trail requests. */
export const ADMIN_COMPLIANCE_AUDIT_DEFAULT_PAGE_LIMIT = "25";

/** Actions accepted by GET /compliance/audit-logs. */
export const ADMIN_COMPLIANCE_AUDIT_ACTIONS = [
    "submit",
    "update",
    "delete",
    "add",
    "claim",
    "unclaim",
    "resend",
    "revoke",
    "restore",
    "review:approve",
    "review:reject",
    "review:suspend",
] as const;

/** Compliance-focused audit subjects highlighted by the API docs. */
export const ADMIN_COMPLIANCE_AUDIT_SUBJECTS = [
    "assignment",
    "kyc",
    "kyb",
    "kyc_document",
    "kyb_document",
] as const;

export type AdminComplianceAuditAction = (typeof ADMIN_COMPLIANCE_AUDIT_ACTIONS)[number];
export type AdminComplianceAuditSubject = (typeof ADMIN_COMPLIANCE_AUDIT_SUBJECTS)[number];
