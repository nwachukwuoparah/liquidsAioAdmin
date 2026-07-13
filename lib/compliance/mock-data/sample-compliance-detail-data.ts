import type { AdminComplianceDetailRecord } from "@/lib/compliance/types/admin-compliance-detail.types";

const ASSIGNEE_OPTIONS = ["Sarah Chen", "Jenny Wilson", "Ralph Edwards", "Alex Rivera"];

/** Returns demo compliance detail data for local/sample API routes. */
export function getSampleComplianceDetail(reviewId: string): AdminComplianceDetailRecord {
        return {
        id: reviewId,
        email: "johnpeters@email.com",
        firstName: "John",
        lastName: "Peters",
        profilePicture: undefined,
        accountType: "seller",
        complianceReviewStatus: "in_review",
        submittedAt: "2025-10-08T10:00:00.000Z",
        complianceUpdatedAt: "2025-10-09T14:30:00.000Z",
        documentsApprovedCount: 1,
        documentsTotalCount: 3,
        assignedTo: "Sarah Chen",
        assigneeOptions: ASSIGNEE_OPTIONS,
        verificationType: "kyb",
        verificationId: `${reviewId}-kyb`,
        documents: [
            {
                id: `${reviewId}-doc-1`,
                title: "Valid Government-issued ID",
                category: "Identification",
                submittedAt: "2025-10-08T10:00:00.000Z",
                status: "approved",
                fileUrl: "https://example.com/documents/id.pdf",
            },
            {
                id: `${reviewId}-doc-2`,
                title: "EIN Confirmation Letter or IRS-issued W-9",
                category: "Tax Document",
                submittedAt: "2025-10-08T10:00:00.000Z",
                status: "pending",
                fileUrl: "https://example.com/documents/w9.pdf",
            },
            {
                id: `${reviewId}-doc-3`,
                title: "State Business License",
                category: "License",
                submittedAt: "2025-10-08T10:00:00.000Z",
                status: "rejected",
                fileUrl: "https://example.com/documents/license.pdf",
            },
        ],
    };
}
