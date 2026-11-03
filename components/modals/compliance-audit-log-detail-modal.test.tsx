import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComplianceAuditLogDetailModal from "./compliance-audit-log-detail-modal";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import type { AdminComplianceAuditLogRecord } from "@/lib/compliance/types/admin-compliance-audit.types";

const mockCloseModal = vi.fn();
vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        closeModal: mockCloseModal,
    }),
}));

const mockViewingLinkQuery = {
    data: { viewingLink: "https://res.cloudinary.com/signed/compliance/test-ein.jpg" },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
};

vi.mock("@/lib/admin/hooks/use-admin-compliance", () => ({
    useAdminComplianceDocumentViewingLink: () => mockViewingLinkQuery,
}));

const mockClipboardWriteText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
    clipboard: {
        writeText: mockClipboardWriteText,
    },
});

const sampleAuditRecord: AdminComplianceAuditLogRecord = {
    id: "audit-1",
    sn: "1.",
    action: "review:approve",
    actionLabel: "Approved",
    subject: "kyb_document",
    subjectLabel: "KYB Document",
    actorTypeLabel: "Admin",
    actorName: "Nwachukwu Oparah",
    actorEmail: "admin@liquids.io",
    targetUserName: "Tester Tester2",
    targetUserEmail: "tester2@liquids.io",
    statusBefore: "pending",
    statusAfter: "approved",
    rejectionReason: "",
    documentType: "ein_document",
    documentFilename: "ein-document.jpg",
    documentTypeLabel: "Ein Document",
    documentCount: 2,
    assignmentBefore: "pending",
    assignmentAfter: "claimed",
    assigneeName: "Nwachukwu Oparah",
    reviewedAtLabel: "Nov 3, 2026, 11:05 AM",
    createdAtLabel: "Just now",
    createdAtExact: "Nov 3, 2026, 11:05 AM",
    eventLabel: "Approved Ein Document",
    summary: "Approved Ein Document by Nwachukwu Oparah · Tester Tester2",
    narrative: "Nwachukwu Oparah approved Tester Tester2's Ein Document, changing status from pending to approved.",
    detailItems: [],
    documents: [
        {
            id: "doc-1",
            typeLabel: "Ein Document",
            filename: "ein-document.jpg",
            format: "jpg",
            status: "approved",
            previewUrl: "https://res.cloudinary.com/unsigned/ein.jpg",
            openUrl: "https://res.cloudinary.com/unsigned/ein.jpg",
            previewCandidates: ["https://res.cloudinary.com/unsigned/ein.jpg"],
            isImage: true,
            fileId: "compliance/MO2vgQ0mIYX4/ein-document",
            verificationType: "kyb",
        },
        {
            id: "doc-2",
            typeLabel: "State Business License",
            filename: "business-license.pdf",
            format: "pdf",
            status: "approved",
            previewUrl: "",
            openUrl: "",
            previewCandidates: [],
            isImage: false,
            fileId: "compliance/MO2vgQ0mIYX4/license",
            verificationType: "kyb",
        },
    ],
};

describe("ComplianceAuditLogDetailModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockViewingLinkQuery.data = {
            viewingLink: "https://res.cloudinary.com/signed/compliance/test-ein.jpg",
        };
        mockViewingLinkQuery.isLoading = false;
        mockViewingLinkQuery.isError = false;
    });

    it("renders audit event header, narrative, and actor details", () => {
        renderWithQueryClient(<ComplianceAuditLogDetailModal log={sampleAuditRecord} />);

        expect(screen.getByText("Approved Ein Document")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Nwachukwu Oparah approved Tester Tester2's Ein Document, changing status from pending to approved.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("Performed by")).toBeInTheDocument();
        expect(screen.getAllByText("Nwachukwu Oparah").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Affected user")).toBeInTheDocument();
        expect(screen.getByText("Tester Tester2")).toBeInTheDocument();
    });

    it("renders signed viewing link badge and document controls", () => {
        renderWithQueryClient(<ComplianceAuditLogDetailModal log={sampleAuditRecord} />);

        expect(screen.getByText("Signed Link (2m expiry)")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Refresh secure viewing link/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Copy secure link/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Open in new tab/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Expand/i })).toBeInTheDocument();
    });

    it("switches active document when multiple documents are present", () => {
        renderWithQueryClient(<ComplianceAuditLogDetailModal log={sampleAuditRecord} />);

        const licenseTab = screen.getByRole("button", { name: "State Business License" });
        fireEvent.click(licenseTab);

        expect(screen.getByText("business-license.pdf · PDF · approved")).toBeInTheDocument();
    });

    it("copies secure signed link to clipboard", () => {
        renderWithQueryClient(<ComplianceAuditLogDetailModal log={sampleAuditRecord} />);

        const copyBtn = screen.getByRole("button", { name: /Copy secure link/i });
        fireEvent.click(copyBtn);

        expect(mockClipboardWriteText).toHaveBeenCalledWith(
            "https://res.cloudinary.com/signed/compliance/test-ein.jpg",
        );
    });

    it("opens and closes full lightbox modal", () => {
        renderWithQueryClient(<ComplianceAuditLogDetailModal log={sampleAuditRecord} />);

        const expandBtn = screen.getByRole("button", { name: /Expand/i });
        fireEvent.click(expandBtn);

        expect(screen.getByLabelText("Close document preview")).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Close document preview"));
        expect(screen.queryByLabelText("Close document preview")).not.toBeInTheDocument();
    });

    it("handles viewing link failure gracefully and falls back to direct asset preview", () => {
        mockViewingLinkQuery.isError = true;
        mockViewingLinkQuery.data = null as any;

        renderWithQueryClient(<ComplianceAuditLogDetailModal log={sampleAuditRecord} />);

        expect(screen.getByText("Direct Asset Preview")).toBeInTheDocument();
    });

    it("switches to Raw JSON tab and allows copying the raw payload", () => {
        renderWithQueryClient(<ComplianceAuditLogDetailModal log={sampleAuditRecord} />);

        const jsonTab = screen.getByRole("button", { name: /Raw JSON/i });
        fireEvent.click(jsonTab);

        expect(screen.getByText("Exact Server Response Payload")).toBeInTheDocument();

        const copyJsonBtn = screen.getByRole("button", { name: /Copy JSON/i });
        fireEvent.click(copyJsonBtn);

        expect(mockClipboardWriteText).toHaveBeenCalledWith(
            expect.stringContaining('"id": "audit-1"'),
        );
    });

    it("renders HTTP and network metadata when present in log", () => {
        const recordWithMetadata: AdminComplianceAuditLogRecord = {
            ...sampleAuditRecord,
            metadata: {
                ip: "105.112.203.184",
                path: "/v1/compliance/01a08d1a/claim",
                method: "POST",
                userAgent: "Mozilla/5.0 TestAgent",
            },
        };

        renderWithQueryClient(<ComplianceAuditLogDetailModal log={recordWithMetadata} />);

        expect(screen.getByText("Request & Network Metadata")).toBeInTheDocument();
        expect(screen.getByText("POST")).toBeInTheDocument();
        expect(screen.getByText("/v1/compliance/01a08d1a/claim")).toBeInTheDocument();
        expect(screen.getByText("105.112.203.184")).toBeInTheDocument();
    });
});

