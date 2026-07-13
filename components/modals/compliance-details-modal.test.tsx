import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComplianceDetailsModal from "./compliance-details-modal";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";

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

const sampleDetail = {
    id: "review-1",
    email: "johnpeters@email.com",
    firstName: "John",
    lastName: "Peters",
    accountType: "seller" as const,
    complianceReviewStatus: "in_review" as const,
    submittedAt: "2025-10-08T10:00:00.000Z",
    complianceUpdatedAt: "2025-10-09T14:30:00.000Z",
    documentsApprovedCount: 1,
    documentsTotalCount: 3,
    assignedTo: "Sarah Chen",
    assigneeOptions: ["Sarah Chen", "Jenny Wilson"],
    verificationType: "kyc" as const,
    verificationId: "kyc-1",
    documents: [
        {
            id: "doc-1",
            title: "Valid Government-issued ID",
            category: "Identification",
            submittedAt: "2025-10-08T10:00:00.000Z",
            status: "approved" as const,
        },
        {
            id: "doc-2",
            title: "EIN Confirmation Letter or IRS-issued W-9",
            category: "Tax Document",
            submittedAt: "2025-10-08T10:00:00.000Z",
            status: "pending" as const,
        },
    ],
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
        detailState.data = { ...sampleDetail };
        claimMutate.mockReset();
        unclaimMutate.mockReset();
    });

    it("renders review profile, summary, and uploaded documents", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getByText("Compliance details")).toBeInTheDocument();
        expect(screen.getByText("John Peters")).toBeInTheDocument();
        expect(screen.getByText("johnpeters@email.com")).toBeInTheDocument();
        expect(screen.getByText("Valid Government-issued ID")).toBeInTheDocument();
        expect(screen.getByText("EIN Confirmation Letter or IRS-issued W-9")).toBeInTheDocument();
        expect(screen.getByText("1 of 3")).toBeInTheDocument();
    });

    it("shows the assigned reviewer and enables Unclaim when a case is claimed", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getByTestId("compliance-assigned-reviewer")).toHaveTextContent("Sarah Chen");
        expect(screen.queryByTestId("compliance-assignee-dropdown")).not.toBeInTheDocument();
        expect(screen.getByTestId("compliance-claim-button")).toBeDisabled();
        expect(screen.getByTestId("compliance-unclaim-button")).toBeEnabled();
    });

    it("shows Unassigned and enables Claim when no reviewer is assigned", () => {
        detailState.data = { ...sampleDetail, assignedTo: "" };
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getByTestId("compliance-assigned-reviewer")).toHaveTextContent("Unassigned");
        expect(screen.getByTestId("compliance-claim-button")).toBeEnabled();
        expect(screen.getByTestId("compliance-unclaim-button")).toBeDisabled();
    });

    it("calls claim when the Claim button is clicked on an unassigned case", () => {
        detailState.data = { ...sampleDetail, assignedTo: "" };
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        fireEvent.click(screen.getByTestId("compliance-claim-button"));

        expect(claimMutate).toHaveBeenCalledWith("Jude Nnamdi");
    });

    it("shows document approve and reject actions only when the case is assigned", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.getByLabelText("Approve")).toBeInTheDocument();
        expect(screen.getByLabelText("Reject")).toBeInTheDocument();
    });

    it("hides document approve and reject actions when the case is unassigned", () => {
        detailState.data = { ...sampleDetail, assignedTo: "" };
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        expect(screen.queryByLabelText("Approve")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Reject")).not.toBeInTheDocument();
        expect(screen.getAllByLabelText("View").length).toBeGreaterThan(0);
    });

    it("calls unclaim when the Unclaim button is clicked", () => {
        renderWithQueryClient(<ComplianceDetailsModal userId="review-1" />);

        fireEvent.click(screen.getByTestId("compliance-unclaim-button"));

        expect(unclaimMutate).toHaveBeenCalled();
    });
});
