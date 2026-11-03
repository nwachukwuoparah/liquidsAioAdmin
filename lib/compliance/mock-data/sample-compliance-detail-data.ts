import type { AdminComplianceDetailData } from "@/lib/compliance/types/admin-compliance-detail.types";

/** Returns demo compliance detail data for local/sample API routes. */
export function getSampleComplianceDetail(reviewId: string): AdminComplianceDetailData {
    return {
        complianceData: {
            id: reviewId,
            email: "johnpeters@email.com",
            firstName: "John",
            lastName: "Peters",
            profilePicture: null,
            accountType: "seller",
            complianceReviewStatus: "in_review",
            complianceUpdatedAt: "2025-10-09T14:30:00.000Z",
            complianceReviewAssignment: {
                id: `${reviewId}-assignment`,
                userId: reviewId,
                assignedAdminId: "admin-1",
                status: "claimed",
                createdAt: "2025-10-08T10:00:00.000Z",
                updatedAt: "2025-10-09T14:30:00.000Z",
                assignedAdmin: {
                    id: "admin-1",
                    firstName: "Sarah",
                    lastName: "Chen",
                    email: "sarah.chen@liquidsaio.com",
                },
            },
        },
        kyb: {
            id: `${reviewId}-kyb`,
            userId: reviewId,
            businessName: "Peters Wholesale LLC",
            status: "in_review",
            createdAt: "2025-10-08T10:00:00.000Z",
            updatedAt: "2025-10-09T14:30:00.000Z",
            kybDocuments: [
                {
                    id: `${reviewId}-doc-2`,
                    kybId: `${reviewId}-kyb`,
                    type: "ein_document",
                    fileId: "compliance/sample/w9",
                    format: "pdf",
                    originalFilename: "EIN Confirmation Letter or IRS-issued W-9",
                    status: "pending",
                    createdAt: "2025-10-08T10:00:00.000Z",
                },
                {
                    id: `${reviewId}-doc-3`,
                    kybId: `${reviewId}-kyb`,
                    type: "state_business_license",
                    fileId: "compliance/sample/license",
                    format: "pdf",
                    originalFilename: "State Business License",
                    status: "rejected",
                    createdAt: "2025-10-08T10:00:00.000Z",
                },
            ],
        },
        kyc: {
            id: `${reviewId}-kyc`,
            userId: reviewId,
            firstName: "John",
            lastName: "Peters",
            status: "approved",
            createdAt: "2025-10-08T10:00:00.000Z",
            updatedAt: "2025-10-09T14:30:00.000Z",
            kycDocuments: [
                {
                    id: `${reviewId}-doc-1`,
                    userId: reviewId,
                    kycId: `${reviewId}-kyc`,
                    type: "gov_id",
                    fileId: "compliance/sample/id",
                    format: "pdf",
                    originalFilename: "Valid Government-issued ID",
                    status: "approved",
                    createdAt: "2025-10-08T10:00:00.000Z",
                },
            ],
        },
    };
}
