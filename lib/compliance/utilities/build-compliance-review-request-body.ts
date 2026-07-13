import {
    getComplianceDocumentIdKey,
    getComplianceVerificationIdKey,
    type ComplianceReviewAction,
    type ComplianceVerificationType,
} from "@/lib/compliance/constants/admin-compliance-review.constant";

/** Builds the review payload for a single document. */
export function buildComplianceDocumentReviewRequestBody(
    verificationType: ComplianceVerificationType,
    documentId: string,
    action: ComplianceReviewAction,
    rejectionReason?: string,
): Record<string, string> {
    const payload: Record<string, string> = {
        type: verificationType,
        action,
        [getComplianceDocumentIdKey(verificationType)]: documentId,
    };

    if (rejectionReason?.trim()) {
        payload.rejectionReason = rejectionReason.trim();
    }

    return payload;
}

/** Builds the review payload for an entire compliance review. */
export function buildComplianceReviewRequestBody(
    verificationType: ComplianceVerificationType,
    verificationId: string,
    action: ComplianceReviewAction,
    rejectionReason?: string,
): Record<string, string> {
    const payload: Record<string, string> = {
        type: verificationType,
        action,
        [getComplianceVerificationIdKey(verificationType)]: verificationId,
    };

    if (rejectionReason?.trim()) {
        payload.rejectionReason = rejectionReason.trim();
    }

    return payload;
}
