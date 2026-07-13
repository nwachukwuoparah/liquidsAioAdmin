import type { ComplianceVerificationType } from "@/lib/compliance/constants/admin-compliance-review.constant";

export interface ComplianceReviewMutationVariables {
    userId: string;
    payload: Record<string, string>;
}

export interface ComplianceReviewModalContext {
    userId: string;
    verificationType: ComplianceVerificationType;
    verificationId: string;
}
