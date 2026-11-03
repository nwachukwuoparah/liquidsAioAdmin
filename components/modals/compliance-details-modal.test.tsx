import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComplianceDetailsModal from "./compliance-details-modal";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import type { AdminComplianceDetailData } from "@/lib/compliance/types/admin-compliance-detail.types";

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        closeModal: vi.fn(),
        showModal: vi.fn(),
    }),
}));

vi.mock("@/lib/auth/hooks/use-admin-session-profile", () => ({
    useAdminSessionProfile: () => ({
        sessionProfile: {
            displayName: "Jude Nnamdi",
            email: "jude@liquidsaio.com",
            roleLabel: "ADMIN",
            profileImageUrl: null,
            initials: "JN",
        },
        isSessionProfileReady: true,
    }),
}));

const sampleDetail: AdminComplianceDetailData = {
    complianceData: {
        id: "review-1",
        email: "johnpeters@email.com",
        firstName: "John",
        lastName: "Peters",
        accountType: "seller",
        complianceReviewStatus: "in_review",
        complianceUpdatedAt: "2025-10-09T14:30:00.000Z",
        complianceReviewAssignment: {
            id: "assignment-1",
            userId: "review-1",
            assignedAdminId: "admin-1",
            status: "claimed",
            createdAt: "2025-10-08T10:00:00.000Z",
            updatedAt: "2025-10-09T14:30:00.000Z",
            assignedAdmin: {
                id: "admin-1",
                firstName: "Sarah",
                lastName: "Chen",
                email: "sarah@example.com",
            },
        },
    },
    kyb: {
        id: "kyb-1",
        userId: "review-1",
        businessName: "Peters Wholesale",
        status: "in_review",
        createdAt: "2025-10-08T10:00:00.000Z",
        updatedAt: "2025-10-09T14:30:00.000Z",
        kybDocuments: [
            {
                id: "doc-2",
                kybId: "kyb-1",
                type: "ein_document",
                fileId: "compliance/sample/w9",
                originalFilename: "EIN Confirmation Letter or IRS-issued W-9",
                status: "pending",
                createdAt: "2025-10-08T10:00:00.000Z",
            },
        ],
    },
    kyc: {
        id: "kyc-1",
        userId: "review-1",
        firstName: "John",
        lastName: "Peters",
        status: "in_review",
        createdAt: "2025-10-08T10:00:00.000Z",
        updatedAt: "2025-10-09T14:30:00.000Z",
        kycDocuments: [
            {
                id: "doc-1",
                userId: "review-1",
                kycId: "kyc-1",
                type: "gov_id",
                fileId: "compliance/sample/id",
                originalFilename: "Valid Government-issued ID",
                status: "pending",
                createdAt: "2025-10-08T10:00:00.000Z",
            },
        ],
    },
};

const detailState = {
    data: { ...sampleDetail },
};

const claimMutate = vi.fn();
const unclaimMutate = vi.fn();

vi.mock("@/lib/admin/hooks/use-admin-compliance", () => ({
    useAdminComplianceDetail: () => ({
        get data() {
            return detailState.data;
        },
        isLoading: false,
        isError: false,
    }),
    useAdminComplianceClaim: () => ({
        mutate: claimMutate,
        isPending: false,
    }),
    useAdminComplianceUnclaim: () => ({
        mutate: unclaimMutate,
        isPending: false,
    }),
}));

describe("ComplianceDetailsModal", () => {
    beforeEach(() => {
        detailState.data = JSON.parse(JSON.stringify(sampleDetail));
        claimMutate.mockReset();
        unclaimMutate.mockReset();
    });

    it("renders review profile, summary, and uploaded documents from server structure", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getByText("Compliance details")).toBeInTheDocument();
        expect(screen.getByText("John Peters")).toBeInTheDocument();
        expect(screen.getByText("johnpeters@email.com")).toBeInTheDocument();
        expect(screen.getByText("Valid Government-issued ID")).toBeInTheDocument();
        expect(screen.getByText("EIN Confirmation Letter or IRS-issued W-9")).toBeInTheDocument();
        expect(screen.getByText("0 of 2")).toBeInTheDocument();
    });

    it("shows the assigned reviewer and enables Unclaim when a case is claimed", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getByTestId("compliance-assigned-reviewer")).toHaveTextContent("Sarah Chen");
        expect(screen.queryByTestId("compliance-assignee-dropdown")).not.toBeInTheDocument();
        expect(screen.getByTestId("compliance-claim-button")).toBeDisabled();
        expect(screen.getByTestId("compliance-unclaim-button")).toBeEnabled();
    });

    it("shows Unassigned and enables Claim when no reviewer is assigned", () => {
        detailState.data = {
            ...sampleDetail,
            complianceData: {
                ...sampleDetail.complianceData,
                complianceReviewAssignment: null,
            },
        };
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getByTestId("compliance-assigned-reviewer")).toHaveTextContent("Unassigned");
        expect(screen.getByTestId("compliance-claim-button")).toBeEnabled();
        expect(screen.getByTestId("compliance-unclaim-button")).toBeDisabled();
    });

    it("calls claim when the Claim button is clicked on an unassigned case", () => {
        detailState.data = {
            ...sampleDetail,
            complianceData: {
                ...sampleDetail.complianceData,
                complianceReviewAssignment: null,
            },
        };
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        fireEvent.click(screen.getByTestId("compliance-claim-button"));

        expect(claimMutate).toHaveBeenCalledWith("Jude Nnamdi");
    });

    it("shows document approve and reject actions only for pending documents when assigned", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getAllByLabelText("Approve").length).toBe(2);
        expect(screen.getAllByLabelText("Reject").length).toBe(2);
    });

    it("hides approve and reject actions for already approved or rejected documents", () => {
        detailState.data = {
            ...sampleDetail,
            kyc: {
                ...sampleDetail.kyc!,
                kycDocuments: [
                    {
                        ...sampleDetail.kyc!.kycDocuments![0]!,
                        status: "approved",
                    },
                ],
            },
            kyb: {
                ...sampleDetail.kyb!,
                kybDocuments: [
                    {
                        ...sampleDetail.kyb!.kybDocuments![0]!,
                        status: "rejected",
                    },
                ],
            },
        };
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.queryByLabelText("Approve")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Reject")).not.toBeInTheDocument();
        expect(screen.getAllByLabelText("View").length).toBe(2);
    });

    it("hides verify and reject actions when the case has not been claimed", () => {
        detailState.data = {
            ...sampleDetail,
            complianceData: {
                ...sampleDetail.complianceData,
                complianceReviewAssignment: null,
            },
        };
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.queryByLabelText("Approve")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Reject")).not.toBeInTheDocument();
        expect(screen.queryByText("Approve KYC")).not.toBeInTheDocument();
        expect(screen.queryByText("Reject KYC")).not.toBeInTheDocument();
        expect(screen.getAllByLabelText("View").length).toBeGreaterThan(0);
    });

    it("renders full section review actions for KYB and KYC when claimed and not decided", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getByText("Business Verification (KYB)")).toBeInTheDocument();
        expect(screen.getByText("Approve KYB")).toBeInTheDocument();
        expect(screen.getByText("Reject KYB")).toBeInTheDocument();

        expect(screen.getByText("Identity Verification (KYC)")).toBeInTheDocument();
        expect(screen.getByText("Approve KYC")).toBeInTheDocument();
        expect(screen.getByText("Reject KYC")).toBeInTheDocument();
    });

    it("hides claim and unclaim buttons when compliance is approved", () => {
        detailState.data = {
            ...sampleDetail,
            complianceData: {
                ...sampleDetail.complianceData,
                complianceReviewStatus: "approved",
                complianceReviewAssignment: null,
            },
            kyc: {
                ...sampleDetail.kyc!,
                status: "approved",
            },
        };
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.queryByTestId("compliance-claim-button")).not.toBeInTheDocument();
        expect(screen.queryByTestId("compliance-unclaim-button")).not.toBeInTheDocument();
        expect(screen.queryByTestId("compliance-assigned-reviewer")).not.toBeInTheDocument();
    });

    it("calls unclaim when the Unclaim button is clicked", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        fireEvent.click(screen.getByTestId("compliance-unclaim-button"));

        expect(unclaimMutate).toHaveBeenCalled();
    });
});
