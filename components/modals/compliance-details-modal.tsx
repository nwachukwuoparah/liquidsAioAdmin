"use client";

import { ProfileAvatar } from "@/components/profile-avatar";
import Typography from "@/components/typography";
import {
    ApproveCheckIcon,
    ArrowLeftIcon,
    EyeIcon,
    FileTextIcon,
    ModalCloseIcon,
    RejectXIcon,
} from "@/components/vector";
import ComplianceApproveDocumentModal from "@/components/modals/compliance-approve-document-modal";
import ComplianceRejectDocumentModal from "@/components/modals/compliance-reject-document-modal";
import ComplianceApproveReviewModal from "@/components/modals/compliance-approve-review-modal";
import ComplianceRejectReviewModal from "@/components/modals/compliance-reject-review-modal";
import ComplianceDocumentViewerModal from "@/components/modals/compliance-document-viewer-modal";
import { useModal } from "@/context/modal-provider";
import {
    useAdminComplianceClaim,
    useAdminComplianceDetail,
    useAdminComplianceUnclaim,
} from "@/lib/admin/hooks/use-admin-compliance";
import type {
    ComplianceDocumentRecord,
    ComplianceDocumentStatus,
    ComplianceVerificationType,
} from "@/lib/compliance/types/admin-compliance-detail.types";
import { buildCloudinaryDocumentUrl } from "@/lib/compliance/utilities/build-cloudinary-document-url";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";
import { useAdminSessionProfile } from "@/lib/auth/hooks/use-admin-session-profile";
import { DEFAULT_ADMIN_DISPLAY_NAME } from "@/lib/auth/utilities/resolve-admin-session-profile";
import { getProfileDisplayName } from "@/lib/profile-avatar";
import { useCallback, useMemo, type ReactNode } from "react";

interface ComplianceDetailsModalProps {
    userId: string;
}

const KYC_DOCUMENT_TYPE_LABELS: Record<string, string> = {
    gov_id: "Government ID",
    ein: "EIN Confirmation",
    ein_document: "EIN Confirmation",
    w9: "W-9",
    business_license: "Business License",
    state_business_license: "State Business License",
    certificate_of_incorporation: "Certificate of Incorporation",
    articles_of_incorporation: "Articles of Incorporation",
    bank_statement: "Bank Statement",
    utility_bill: "Utility Bill",
    tax_id: "Tax ID",
    tin: "TIN Confirmation",
};

function formatDocumentType(type?: string): string {
    if (!type?.trim()) {
        return "Document";
    }

    const normalizedType = type.trim().toLowerCase();
    if (KYC_DOCUMENT_TYPE_LABELS[normalizedType]) {
        return KYC_DOCUMENT_TYPE_LABELS[normalizedType];
    }

    return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDisplayDate(isoDate?: string): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatReviewStatusLabel(status?: string): string {
    switch (status?.toLowerCase()) {
        case "in_review":
            return "In Review";
        case "approved":
            return "Approved";
        case "rejected":
            return "Rejected";
        default:
            return "Pending";
    }
}

function getReviewStatusClasses(status?: string): { bg: string; text: string } {
    switch (status?.toLowerCase()) {
        case "approved":
            return { bg: "bg-[#00A34114]", text: "text-[#00A341]" };
        case "rejected":
            return { bg: "bg-[#CC292914]", text: "text-[#CC2929]" };
        case "in_review":
            return { bg: "bg-[#0B0E050A]", text: "text-[#0B0E05CC]" };
        default:
            return { bg: "bg-[#DC680314]", text: "text-[#DC6803]" };
    }
}

function getDocumentStatusClasses(status: ComplianceDocumentStatus): { bg: string; text: string } {
    switch (status) {
        case "approved":
            return { bg: "bg-[#00A34114]", text: "text-[#00A341]" };
        case "rejected":
            return { bg: "bg-[#CC292914]", text: "text-[#CC2929]" };
        default:
            return { bg: "bg-[#DC680314]", text: "text-[#DC6803]" };
    }
}

function formatDocumentStatusLabel(status: ComplianceDocumentStatus): string {
    switch (status) {
        case "approved":
            return "Approved";
        case "rejected":
            return "Rejected";
        default:
            return "Pending";
    }
}

interface DocumentActionButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    children: ReactNode;
}

function DocumentActionButton({
    label,
    onClick,
    disabled = false,
    className = "",
    children,
}: DocumentActionButtonProps) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-[#0B0E050A] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}

interface ComplianceDocumentRowProps {
    document: ComplianceDocumentRecord;
    canReview?: boolean;
    onDocumentAction: (
        document: ComplianceDocumentRecord,
        action: "approve" | "reject",
    ) => void;
    onViewDocument: (document: ComplianceDocumentRecord) => void;
}

function ComplianceDocumentRow({
    document,
    canReview = false,
    onDocumentAction,
    onViewDocument,
}: ComplianceDocumentRowProps) {
    const statusClasses = getDocumentStatusClasses(document.status);
    const isDecided =
        document.status?.toLowerCase() === "approved" ||
        document.status?.toLowerCase() === "rejected";
    const showReviewActions = canReview && !isDecided;

    return (
        <div className="rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B0E050A]">
                        <FileTextIcon className="h-5 w-5 text-[#0B0E05A3]" />
                    </div>

                    <div className="flex min-w-0 flex-col">
                        <Typography
                            type="text14"
                            fontWeight={700}
                            className="text-[#0B0E05]"
                            truncate
                            maxLength={48}
                        >
                            {document.title}
                        </Typography>
                        <div className="flex items-center gap-2">
                            <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3]">
                                {document.category} • {formatDisplayDate(document.submittedAt)}
                            </Typography>
                            <span className={`inline-block rounded-md px-2 py-0.5 ${statusClasses.bg}`}>
                                <Typography type="text12" fontWeight={600} className={statusClasses.text}>
                                    {formatDocumentStatusLabel(document.status)}
                                </Typography>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {showReviewActions ? (
                        <>
                            <DocumentActionButton
                                label="Approve"
                                onClick={() => onDocumentAction(document, "approve")}
                                className="hover:bg-green-50/60"
                            >
                                <ApproveCheckIcon className="h-3.5 w-4 text-[#00A341]" />
                            </DocumentActionButton>

                            <DocumentActionButton
                                label="Reject"
                                onClick={() => onDocumentAction(document, "reject")}
                                className="hover:bg-red-50/60"
                            >
                                <RejectXIcon className="h-4 w-4 text-[#CC2929]" />
                            </DocumentActionButton>
                        </>
                    ) : null}

                    <DocumentActionButton
                        label="View"
                        onClick={() => onViewDocument(document)}
                    >
                        <EyeIcon className="h-4 w-4 text-[#0B0E05]" />
                    </DocumentActionButton>
                </div>
            </div>
        </div>
    );
}

interface ComplianceSectionReviewProps {
    title: string;
    subtitle?: string;
    status: string;
    verificationType: ComplianceVerificationType;
    verificationId?: string;
    canReview?: boolean;
    onReviewAction: (
        verificationType: ComplianceVerificationType,
        verificationId: string,
        action: "approve" | "reject",
        label: string,
    ) => void;
    children: ReactNode;
}

function ComplianceSectionReview({
    title,
    subtitle,
    status,
    verificationType,
    verificationId,
    canReview = false,
    onReviewAction,
    children,
}: ComplianceSectionReviewProps) {
    const statusClasses = getReviewStatusClasses(status);
    const label = verificationType.toUpperCase();

    return (
        <div className="space-y-3 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B0E0514] pb-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                            {title}
                        </Typography>
                        <span className={`inline-block rounded-md px-2 py-0.5 ${statusClasses.bg}`}>
                            <Typography type="text12" fontWeight={600} className={statusClasses.text}>
                                {formatReviewStatusLabel(status)}
                            </Typography>
                        </span>
                    </div>
                    {subtitle ? (
                        <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3]">
                            {subtitle}
                        </Typography>
                    ) : null}
                </div>

                {canReview &&
                status?.toLowerCase() !== "approved" &&
                status?.toLowerCase() !== "rejected" ? (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={!verificationId}
                            onClick={() => {
                                if (verificationId) {
                                    onReviewAction(
                                        verificationType,
                                        verificationId,
                                        "approve",
                                        `${label} submission`,
                                    );
                                }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#00A34133] bg-[#00A34114] px-3.5 py-1.5 transition-colors hover:bg-[#00A34129] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ApproveCheckIcon className="h-3.5 w-3.5 text-[#00A341]" />
                            <Typography type="text12" fontWeight={700} className="text-[#00A341]">
                                Approve {label}
                            </Typography>
                        </button>
                        <button
                            type="button"
                            disabled={!verificationId}
                            onClick={() => {
                                if (verificationId) {
                                    onReviewAction(
                                        verificationType,
                                        verificationId,
                                        "reject",
                                        `${label} submission`,
                                    );
                                }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#CC292933] bg-[#CC292914] px-3.5 py-1.5 transition-colors hover:bg-[#CC292929] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RejectXIcon className="h-3.5 w-3.5 text-[#CC2929]" />
                            <Typography type="text12" fontWeight={700} className="text-[#CC2929]">
                                Reject {label}
                            </Typography>
                        </button>
                    </div>
                ) : null}
            </div>

            <div className="space-y-3 pt-1">{children}</div>
        </div>
    );
}

/** Compliance review detail modal with document actions and full KYC/KYB controls. */
export default function ComplianceDetailsModal({ userId }: ComplianceDetailsModalProps) {
    const { closeModal, showModal } = useModal();
    const { sessionProfile } = useAdminSessionProfile();
    const detailQuery = useAdminComplianceDetail(userId);
    const claimMutation = useAdminComplianceClaim(userId);
    const unclaimMutation = useAdminComplianceUnclaim(userId);

    const rawData = (detailQuery.data as any)?.data ?? detailQuery.data;
    const complianceData = rawData?.complianceData ?? rawData;
    const kyb = rawData?.kyb ?? complianceData?.kyb;
    const kyc = rawData?.kyc ?? complianceData?.kyc;

    const firstName = complianceData?.firstName ?? kyc?.firstName ?? rawData?.firstName ?? "";
    const lastName = complianceData?.lastName ?? kyc?.lastName ?? rawData?.lastName ?? "";
    const email = complianceData?.email ?? rawData?.email ?? "";
    const profilePicture = complianceData?.profilePicture ?? rawData?.profilePicture ?? undefined;

    const fullName = useMemo(
        () => [firstName, lastName].filter(Boolean).join(" ").trim(),
        [firstName, lastName],
    );

    const profileName = useMemo(
        () => getProfileDisplayName(firstName, lastName, email),
        [email, firstName, lastName],
    );

    const avatarName = useMemo(
        () => fullName || email,
        [fullName, email],
    );

    const rawKybDocs: any[] = useMemo(() => {
        return (
            kyb?.kybDocuments ??
            kyb?.documents ??
            complianceData?.kybDocuments ??
            rawData?.kybDocuments ??
            []
        );
    }, [complianceData?.kybDocuments, kyb?.documents, kyb?.kybDocuments, rawData?.kybDocuments]);

    const rawKycDocs: any[] = useMemo(() => {
        return (
            kyc?.kycDocuments ??
            kyc?.documents ??
            complianceData?.kycDocuments ??
            complianceData?.documents ??
            rawData?.kycDocuments ??
            rawData?.documents ??
            []
        );
    }, [
        complianceData?.documents,
        complianceData?.kycDocuments,
        kyc?.documents,
        kyc?.kycDocuments,
        rawData?.documents,
        rawData?.kycDocuments,
    ]);

    const isSeller = Boolean(
        kyb ||
            rawKybDocs.length > 0 ||
            complianceData?.accountType?.toLowerCase() === "seller" ||
            rawData?.accountType?.toLowerCase() === "seller",
    );
    const accountTypeLabel = isSeller ? "SELLER ACCOUNT" : "BUYER ACCOUNT";

    const complianceReviewStatus =
        complianceData?.complianceReviewStatus ??
        rawData?.complianceReviewStatus ??
        kyc?.status ??
        kyb?.status ??
        "pending";
    const reviewStatusClasses = getReviewStatusClasses(complianceReviewStatus);

    const assignment =
        complianceData?.complianceReviewAssignment ?? rawData?.complianceReviewAssignment;
    const isClaimed =
        assignment?.status === "claimed" || Boolean((rawData as any)?.assignedTo);
    const assignedAdmin = assignment?.assignedAdmin;
    const assignedAdminName =
        (rawData as any)?.assignedTo ||
        (assignedAdmin
            ? [assignedAdmin.firstName, assignedAdmin.lastName].filter(Boolean).join(" ").trim() ||
              assignedAdmin.email ||
              "Claimed"
            : isClaimed
              ? "Claimed"
              : "Unassigned");

    const isCaseApproved =
        complianceReviewStatus?.toLowerCase() === "approved" ||
        (kyc?.status?.toLowerCase() === "approved" &&
            (!isSeller || kyb?.status?.toLowerCase() === "approved"));

    const isAssigned = isClaimed;
    const assignedReviewerLabel = isAssigned ? assignedAdminName : "Unassigned";
    const isClaimActionPending = claimMutation.isPending || unclaimMutation.isPending;
    const canReviewDocuments = isAssigned;

    const kybDocuments = useMemo<ComplianceDocumentRecord[]>(() => {
        return rawKybDocs.map((doc: any, index: number) => ({
            id: doc.id ?? doc.kybDocumentId ?? doc.documentId ?? `kyb-doc-${index}`,
            title: doc.originalFilename?.trim() || doc.title?.trim() || formatDocumentType(doc.type),
            category: formatDocumentType(doc.type),
            submittedAt: doc.createdAt ?? doc.submittedAt ?? "",
            status: (doc.status || "pending") as ComplianceDocumentStatus,
            fileUrl: doc.fileUrl || buildCloudinaryDocumentUrl(doc.fileId, doc.format),
            fileId: doc.fileId,
            format: doc.format,
            verificationType: "kyb" as const,
        }));
    }, [rawKybDocs]);

    const kycDocuments = useMemo<ComplianceDocumentRecord[]>(() => {
        return rawKycDocs.map((doc: any, index: number) => ({
            id: doc.id ?? doc.kycDocumentId ?? doc.documentId ?? `kyc-doc-${index}`,
            title: doc.originalFilename?.trim() || doc.title?.trim() || formatDocumentType(doc.type),
            category: formatDocumentType(doc.type),
            submittedAt: doc.createdAt ?? doc.submittedAt ?? "",
            status: (doc.status || "pending") as ComplianceDocumentStatus,
            fileUrl: doc.fileUrl || buildCloudinaryDocumentUrl(doc.fileId, doc.format),
            fileId: doc.fileId,
            format: doc.format,
            verificationType: "kyc" as const,
        }));
    }, [rawKycDocs]);

    const allDocuments = useMemo(
        () => [...kybDocuments, ...kycDocuments],
        [kybDocuments, kycDocuments],
    );

    const documentsTotalCount = allDocuments.length;
    const documentsApprovedCount = allDocuments.filter((d) => d.status === "approved").length;
    const submittedAt =
        kyb?.createdAt ??
        kyc?.createdAt ??
        complianceData?.complianceUpdatedAt ??
        rawData?.complianceUpdatedAt ??
        "";
    const complianceUpdatedAt =
        complianceData?.complianceUpdatedAt ??
        rawData?.complianceUpdatedAt ??
        kyb?.updatedAt ??
        kyc?.updatedAt ??
        "";

    const kybVerificationId =
        kyb?.id ??
        (kyb as any)?.kybId ??
        (complianceData as any)?.kybId ??
        (rawData as any)?.kybId ??
        (rawKybDocs?.[0] as any)?.kybId ??
        "";

    const kycVerificationId =
        kyc?.id ??
        (kyc as any)?.kycId ??
        (complianceData as any)?.kycId ??
        (rawData as any)?.kycId ??
        (rawKycDocs?.[0] as any)?.kycId ??
        "";

    const handleClaim = useCallback(() => {
        claimMutation.mutate(sessionProfile?.displayName ?? DEFAULT_ADMIN_DISPLAY_NAME);
    }, [claimMutation, sessionProfile?.displayName]);

    const handleDocumentAction = useCallback(
        (document: ComplianceDocumentRecord, action: "approve" | "reject") => {
            const verificationType = document.verificationType ?? (isSeller ? "kyb" : "kyc");

            if (action === "approve") {
                showModal({
                    content: (
                        <ComplianceApproveDocumentModal
                            userId={userId}
                            document={document}
                            verificationType={verificationType}
                        />
                    ),
                    panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
                });
                return;
            }

            showModal({
                content: (
                    <ComplianceRejectDocumentModal
                        userId={userId}
                        document={document}
                        verificationType={verificationType}
                    />
                ),
                panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
            });
        },
        [isSeller, showModal, userId],
    );

    const handleFullReviewAction = useCallback(
        (
            verificationType: ComplianceVerificationType,
            verificationId: string,
            action: "approve" | "reject",
            label: string,
        ) => {
            if (action === "approve") {
                showModal({
                    content: (
                        <ComplianceApproveReviewModal
                            userId={userId}
                            verificationType={verificationType}
                            verificationId={verificationId}
                            targetLabel={label}
                        />
                    ),
                    panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
                });
                return;
            }

            showModal({
                content: (
                    <ComplianceRejectReviewModal
                        userId={userId}
                        verificationType={verificationType}
                        verificationId={verificationId}
                        targetLabel={label}
                    />
                ),
                panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
            });
        },
        [showModal, userId],
    );

    const handleViewDocument = useCallback(
        (document: ComplianceDocumentRecord) => {
            const verificationType = document.verificationType ?? (isSeller ? "kyb" : "kyc");
            showModal({
                content: (
                    <ComplianceDocumentViewerModal
                        userId={userId}
                        document={document}
                        verificationType={verificationType}
                        canReview={canReviewDocuments}
                    />
                ),
                panelClassName: "w-full max-w-6xl p-0 bg-transparent border-0 shadow-none",
            });
        },
        [canReviewDocuments, isSeller, showModal, userId],
    );

    const showKybSection = isSeller || Boolean(kyb) || kybDocuments.length > 0;
    const showKycSection = !isSeller || Boolean(kyc) || kycDocuments.length > 0 || !showKybSection;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
            <div className="flex h-full w-full flex-col overflow-hidden bg-white md:h-[90vh] md:max-h-[90vh] md:w-[58%] md:rounded-[13px] md:shadow-2xl">

                <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-[#0B0E0514] bg-white px-5 py-3.5">
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="mr-4 text-slate-800 md:hidden"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon className="h-6 w-6 text-[#0B0E05]" />
                        </button>
                        <Typography type="text20" fontWeight={700} className="text-slate-900">
                            Compliance details
                        </Typography>
                    </div>
                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close"
                        className="hidden rounded-lg p-1 text-[#0B0E05] hover:bg-[#0B0E050A] md:block"
                    >
                        <ModalCloseIcon className="h-5 w-5 cursor-pointer text-[#0B0E05]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 p-5 md:p-6">
                    {detailQuery.isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-16 rounded-xl bg-[#0B0E050A]" />
                            <div className="h-28 rounded-xl bg-[#0B0E050A]" />
                            <div className="h-40 rounded-xl bg-[#0B0E050A]" />
                        </div>
                    ) : detailQuery.isError && !rawData ? (
                        <EmptyDetailState message="Unable to load compliance details." />
                    ) : rawData ? (
                        <>
                            <div className="flex flex-col justify-between gap-4 border-b border-[#0B0E0514] pb-5 md:flex-row md:items-center">
                                <div className="flex flex-1 items-center gap-4">
                                    <ProfileAvatar
                                        size="xxl"
                                        name={avatarName}
                                        email={email}
                                        imageUrl={profilePicture}
                                    />
                                    <div className="flex flex-col">
                                        {fullName ? (
                                            <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                                {fullName}
                                            </Typography>
                                        ) : null}
                                        <Typography
                                            type={fullName ? "text14" : "text16"}
                                            fontWeight={fullName ? 400 : 700}
                                            className={fullName ? "text-[#0B0E05A3]" : "text-[#0B0E05]"}
                                        >
                                            {email || profileName}
                                        </Typography>
                                        <Typography
                                            type="text12"
                                            fontWeight={700}
                                            className={isSeller ? "text-[#518300]" : "text-[#00A341]"}
                                        >
                                            {accountTypeLabel}
                                        </Typography>
                                    </div>
                                </div>

                                {!isCaseApproved ? (
                                    <div className="flex flex-col gap-2.5 md:items-end">
                                        <div className="flex items-center gap-2">
                                            <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                                Assigned to:
                                            </Typography>
                                            <Typography
                                                type="text14"
                                                fontWeight={600}
                                                className="text-[#0B0E05]"
                                                data-testid="compliance-assigned-reviewer"
                                            >
                                                {assignedReviewerLabel}
                                            </Typography>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                aria-label="Claim compliance case"
                                                data-testid="compliance-claim-button"
                                                disabled={isAssigned || isClaimActionPending}
                                                onClick={handleClaim}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-transparent bg-[#B1EC52] px-6 py-2 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {claimMutation.isPending ? (
                                                    <span
                                                        className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#0B0E05]/25 border-t-[#0B0E05]"
                                                        aria-hidden
                                                    />
                                                ) : null}
                                                <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                                    {claimMutation.isPending ? "Claiming..." : "Claim"}
                                                </Typography>
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Unclaim compliance case"
                                                data-testid="compliance-unclaim-button"
                                                disabled={!isAssigned || isClaimActionPending}
                                                onClick={() => unclaimMutation.mutate()}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#0B0E0514] bg-[#FFFFFF] px-6 py-2 transition-colors hover:bg-[#0B0E050A] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {unclaimMutation.isPending ? (
                                                    <span
                                                        className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#0B0E05]/25 border-t-[#0B0E05]"
                                                        aria-hidden
                                                    />
                                                ) : null}
                                                <Typography type="text14" fontWeight={600} className="text-[#0B0E05]">
                                                    {unclaimMutation.isPending ? "Unclaiming..." : "Unclaim"}
                                                </Typography>
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <ComplianceSummaryBar
                                reviewStatus={complianceReviewStatus}
                                submittedAt={submittedAt}
                                documentsApprovedCount={documentsApprovedCount}
                                documentsTotalCount={documentsTotalCount}
                                complianceUpdatedAt={complianceUpdatedAt}
                                reviewStatusClasses={reviewStatusClasses}
                            />

                            {/* Business Verification (KYB) */}
                            {showKybSection ? (
                                <ComplianceSectionReview
                                    title="Business Verification (KYB)"
                                    subtitle={kyb?.businessName ? `Business: ${kyb.businessName}` : undefined}
                                    status={kyb?.status ?? complianceReviewStatus}
                                    verificationType="kyb"
                                    verificationId={kybVerificationId}
                                    canReview={canReviewDocuments}
                                    onReviewAction={handleFullReviewAction}
                                >
                                    {kybDocuments.length > 0 ? (
                                        kybDocuments.map((document) => (
                                            <ComplianceDocumentRow
                                                key={document.id}
                                                document={document}
                                                canReview={canReviewDocuments}
                                                onDocumentAction={handleDocumentAction}
                                                onViewDocument={handleViewDocument}
                                            />
                                        ))
                                    ) : (
                                        <div className="rounded-lg bg-[#0B0E0505] p-3 text-center">
                                            <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3]">
                                                No KYB documents uploaded.
                                            </Typography>
                                        </div>
                                    )}
                                </ComplianceSectionReview>
                            ) : null}

                            {/* Identity Verification (KYC) */}
                            {showKycSection ? (
                                <ComplianceSectionReview
                                    title="Identity Verification (KYC)"
                                    subtitle={
                                        kyc?.firstName || kyc?.lastName
                                            ? `Name: ${[kyc.firstName, kyc.lastName].filter(Boolean).join(" ")}`
                                            : firstName || lastName
                                              ? `Name: ${[firstName, lastName].filter(Boolean).join(" ")}`
                                              : undefined
                                    }
                                    status={kyc?.status ?? complianceReviewStatus}
                                    verificationType="kyc"
                                    verificationId={kycVerificationId}
                                    canReview={canReviewDocuments}
                                    onReviewAction={handleFullReviewAction}
                                >
                                    {kycDocuments.length > 0 ? (
                                        kycDocuments.map((document) => (
                                            <ComplianceDocumentRow
                                                key={document.id}
                                                document={document}
                                                canReview={canReviewDocuments}
                                                onDocumentAction={handleDocumentAction}
                                                onViewDocument={handleViewDocument}
                                            />
                                        ))
                                    ) : (
                                        <div className="rounded-lg bg-[#0B0E0505] p-3 text-center">
                                            <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3]">
                                                No KYC documents uploaded.
                                            </Typography>
                                        </div>
                                    )}
                                </ComplianceSectionReview>
                            ) : null}
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function ComplianceSummaryBar({
    reviewStatus,
    submittedAt,
    documentsApprovedCount,
    documentsTotalCount,
    complianceUpdatedAt,
    reviewStatusClasses,
}: {
    reviewStatus: string;
    submittedAt: string;
    documentsApprovedCount: number;
    documentsTotalCount: number;
    complianceUpdatedAt: string;
    reviewStatusClasses: { bg: string; text: string };
}) {
    return (
        <div className="rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-10">
                <div className="flex flex-col gap-3">
                    <SummaryRow label="Status">
                        <span
                            className={`inline-flex shrink-0 rounded-md px-2.5 py-0.5 text-xs font-semibold leading-none no-underline ${reviewStatusClasses.bg} ${reviewStatusClasses.text}`}
                        >
                            {formatReviewStatusLabel(reviewStatus)}
                        </span>
                    </SummaryRow>
                    <SummaryRow label="Submitted" value={formatDisplayDate(submittedAt)} />
                </div>

                <div className="flex flex-col gap-3">
                    <SummaryRow
                        label="Documents approved"
                        value={`${documentsApprovedCount} of ${documentsTotalCount}`}
                    />
                    <SummaryRow label="Last updated" value={formatDisplayDate(complianceUpdatedAt)} />
                </div>
            </div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    children,
}: {
    label: string;
    value?: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-sm text-[#0B0E05A3]">{label}:</span>
            {children ?? (
                <span className="text-right text-sm font-semibold text-[#0B0E05]">{value}</span>
            )}
        </div>
    );
}

function EmptyDetailState({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-[#0B0E0514] bg-[#0B0E050A] p-6 text-center">
            <Typography type="text14" fontWeight={500} className="text-[#0B0E05A3]">
                {message}
            </Typography>
        </div>
    );
}
