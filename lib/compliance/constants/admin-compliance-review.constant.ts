/** Compliance review accept/reject endpoint. */
export const ADMIN_COMPLIANCE_REVIEW_PATH = "/compliance/review";

/** API field key returned when rejectionReason validation fails. */
export const COMPLIANCE_REJECTION_REASON_FIELD_KEY = "rejectionReason";

export type ComplianceVerificationType = "kyc" | "kyb";

export type ComplianceReviewAction = "approve" | "reject";

/** Returns the request body key for a single document id. */
export function getComplianceDocumentIdKey(
    verificationType: ComplianceVerificationType,
): "kycDocumentId" | "kybDocumentId" {
    return verificationType === "kyc" ? "kycDocumentId" : "kybDocumentId";
}

/** Returns the request body key for a full review id. */
export function getComplianceVerificationIdKey(
    verificationType: ComplianceVerificationType,
): "kycId" | "kybId" {
    return verificationType === "kyc" ? "kycId" : "kybId";
}

/** Resolves whether KYC or KYB ids should be used from account type. */
export function resolveComplianceVerificationTypeFromAccountType(
    accountType?: string,
): ComplianceVerificationType {
    return accountType?.toLowerCase() === "seller" ? "kyb" : "kyc";
}
