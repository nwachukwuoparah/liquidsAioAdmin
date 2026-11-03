import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComplianceDocumentViewerModal from "./compliance-document-viewer-modal";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import type { ComplianceDocumentRecord } from "@/lib/compliance/types/admin-compliance-detail.types";

const mockCloseModal = vi.fn();
const mockShowModal = vi.fn();

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        closeModal: mockCloseModal,
        showModal: mockShowModal,
    }),
}));

const mockViewingLinkQuery = {
    data: { viewingLink: "https://res.cloudinary.com/signed/test-doc.pdf" },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
};

vi.mock("@/lib/admin/hooks/use-admin-compliance", () => ({
    useAdminComplianceDocumentViewingLink: () => mockViewingLinkQuery,
}));

const sampleDoc: ComplianceDocumentRecord = {
    id: "doc-1",
    title: "Government ID",
    category: "Identification",
    submittedAt: "2026-09-01T12:00:00.000Z",
    status: "pending",
    fileId: "compliance/sample/gov-id",
    format: "pdf",
    verificationType: "kyc",
};

describe("ComplianceDocumentViewerModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockViewingLinkQuery.data = { viewingLink: "https://res.cloudinary.com/signed/test-doc.pdf" };
        mockViewingLinkQuery.isLoading = false;
        mockViewingLinkQuery.isError = false;
    });

    it("renders document metadata and signed link badge", () => {
        renderWithQueryClient(
            <ComplianceDocumentViewerModal
                userId="user-1"
                document={sampleDoc}
                verificationType="kyc"
                canReview={true}
            />,
        );

        expect(screen.getByText("Government ID")).toBeInTheDocument();
        expect(screen.getByText("Signed Link (2m expiry)")).toBeInTheDocument();
        expect(screen.getByText("Document Information")).toBeInTheDocument();
        expect(screen.getByText("compliance/sample/gov-id")).toBeInTheDocument();
    });

    it("renders review action buttons when canReview is true and document is pending", () => {
        renderWithQueryClient(
            <ComplianceDocumentViewerModal
                userId="user-1"
                document={sampleDoc}
                verificationType="kyc"
                canReview={true}
            />,
        );

        expect(screen.getByText("Review this document")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Approve/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Reject/i })).toBeInTheDocument();
    });

    it("opens approve modal when Approve is clicked", () => {
        renderWithQueryClient(
            <ComplianceDocumentViewerModal
                userId="user-1"
                document={sampleDoc}
                verificationType="kyc"
                canReview={true}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /Approve/i }));
        expect(mockShowModal).toHaveBeenCalled();
    });

    it("opens reject modal when Reject is clicked", () => {
        renderWithQueryClient(
            <ComplianceDocumentViewerModal
                userId="user-1"
                document={sampleDoc}
                verificationType="kyc"
                canReview={true}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /Reject/i }));
        expect(mockShowModal).toHaveBeenCalled();
    });
});
