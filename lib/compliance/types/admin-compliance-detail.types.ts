export type ComplianceDocumentStatus = "pending" | "approved" | "rejected";

export type ComplianceVerificationType = "kyc" | "kyb";

export interface ComplianceDocumentRecord {
    id: string;
    title: string;
    category: string;
    submittedAt: string;
    status: ComplianceDocumentStatus;
    fileUrl?: string;
}

export interface AdminComplianceDetailRecord {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    accountType: "buyer" | "seller";
    complianceReviewStatus: "pending" | "in_review" | "approved" | "rejected";
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

export interface AdminComplianceDetailResponseBody {
    status?: string;
    message?: string;
    data?: AdminComplianceDetailRecord;
}

export interface AdminComplianceAssignRequestBody {
    assignedTo: string;
}
