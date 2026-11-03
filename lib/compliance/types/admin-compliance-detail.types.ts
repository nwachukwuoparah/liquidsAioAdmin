export type ComplianceDocumentStatus = "pending" | "approved" | "rejected" | string;

export type ComplianceVerificationType = "kyc" | "kyb";

export interface AdminComplianceAssignedAdmin {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profilePicture?: string | null;
}

export interface AdminComplianceReviewAssignment {
    id: string;
    userId: string;
    assignedAdminId: string;
    status: "claimed" | "released" | "completed" | string;
    claimedAt?: string | null;
    releasedAt?: string | null;
    releasedByAdminId?: string | null;
    completedAt?: string | null;
    completedByAdminId?: string | null;
    createdAt: string;
    updatedAt: string;
    assignedAdmin?: AdminComplianceAssignedAdmin | null;
    releasedByAdmin?: unknown;
    completedByAdmin?: unknown;
}

export interface AdminComplianceUserComplianceData {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    profilePicture?: string | null;
    complianceUpdatedAt?: string | null;
    complianceReviewStatus?: "pending" | "in_review" | "approved" | "rejected" | string;
    complianceReviewAssignment?: AdminComplianceReviewAssignment | null;
    accountType?: "buyer" | "seller" | string;
    kyc?: AdminComplianceKycData | null;
    kyb?: AdminComplianceKybData | null;
    kycDocuments?: AdminComplianceKycDocument[];
    kybDocuments?: AdminComplianceKybDocument[];
    documents?: (AdminComplianceKycDocument | AdminComplianceKybDocument)[];
}

export interface AdminComplianceKybDocument {
    id: string;
    kybId: string;
    type: string;
    fileId: string;
    format?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
    updatedAt?: string;
    status: "pending" | "approved" | "rejected" | string;
    bytes?: number;
    originalFilename?: string;
    reviewedAt?: string | null;
}

export interface AdminComplianceKybData {
    id: string;
    userId: string;
    businessName?: string | null;
    status: "pending" | "approved" | "rejected" | string;
    rejectionReason?: string | null;
    businessNameLastUpdatedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    reviewedAt?: string | null;
    kybDocuments?: AdminComplianceKybDocument[];
}

export interface AdminComplianceKycDocument {
    id: string;
    userId?: string;
    kycId: string;
    type: string;
    fileId: string;
    format?: string | null;
    rejectionReason?: string | null;
    status: "pending" | "approved" | "rejected" | string;
    bytes?: number;
    originalFilename?: string;
    createdAt: string;
    updatedAt?: string;
    reviewedAt?: string | null;
}

export interface AdminComplianceKycData {
    id: string;
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    phoneNumberCountryCode?: string | null;
    status: "pending" | "approved" | "rejected" | string;
    rejectionReason?: string | null;
    createdAt: string;
    updatedAt: string;
    reviewedAt?: string | null;
    kycDocuments?: AdminComplianceKycDocument[];
}

/** Exact API data response shape for compliance detail. */
export interface AdminComplianceDetailData {
    complianceData: AdminComplianceUserComplianceData;
    kyb?: AdminComplianceKybData | null;
    kyc?: AdminComplianceKycData | null;
}

export interface AdminComplianceDetailRecord {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    accountType: "buyer" | "seller";
    complianceReviewStatus: ComplianceDocumentStatus;
    submittedAt: string;
    complianceUpdatedAt: string;
    documentsApprovedCount: number;
    documentsTotalCount: number;
    assignedTo: string;
    assigneeOptions: string[];
    verificationType: ComplianceVerificationType;
    verificationId: string;
    documents: ComplianceDocumentRecord[];
}

export interface ComplianceDocumentRecord {
    id: string;
    title: string;
    category: string;
    submittedAt: string;
    status: ComplianceDocumentStatus;
    fileUrl?: string;
    fileId?: string;
    format?: string | null;
    verificationType?: ComplianceVerificationType;
}

export interface AdminComplianceDetailResponseBody {
    status?: string;
    message?: string;
    data?: AdminComplianceDetailData;
}

export interface AdminComplianceAssignRequestBody {
    assignedTo: string;
}
