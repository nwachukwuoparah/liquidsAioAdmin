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
import LightbulbIcon from "@/components/vector/light-bulb-icon";
import ComplianceApproveDocumentModal from "@/components/modals/compliance-approve-document-modal";
import ComplianceRejectDocumentModal from "@/components/modals/compliance-reject-document-modal";
import { useModal } from "@/context/modal-provider";
import {
    useAdminComplianceClaim,
    useAdminComplianceDetail,
    useAdminComplianceUnclaim,
} from "@/lib/admin/hooks/use-admin-compliance";
import type {
    ComplianceDocumentRecord,
    ComplianceDocumentStatus,
} from "@/lib/compliance/types/admin-compliance-detail.types";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";
import { useAdminSessionProfile } from "@/lib/auth/hooks/use-admin-session-profile";
import { DEFAULT_ADMIN_DISPLAY_NAME } from "@/lib/auth/utilities/resolve-admin-session-profile";
import { getProfileDisplayName } from "@/lib/profile-avatar";
import { useCallback, useMemo, type ReactNode } from "react";

interface ComplianceDetailsModalProps {
    userId: string;
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

/** Returns true when the case already has a named assignee. */
function hasAssignedReviewer(assignedTo?: string): boolean {
    const trimmedAssignee = assignedTo?.trim();

    if (!trimmedAssignee) {
        return false;
    }

    return trimmedAssignee !== "—" && trimmedAssignee.toLowerCase() !== "unassigned";
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
};

interface ComplianceDocumentRowProps {
    document: ComplianceDocumentRecord;
    canReviewDocuments: boolean;
    onDocumentAction: (
        document: ComplianceDocumentRecord,
        action: "approve" | "reject",
    ) => void;
};

function ComplianceDocumentRow({
    document,
    canReviewDocuments,
    onDocumentAction,
}: ComplianceDocumentRowProps) {
    const statusClasses = getDocumentStatusClasses(document.status);
    const isPending = document.status === "pending";
    const showReviewActions = isPending && canReviewDocuments;

    const handleView = useCallback(() => {
        if (document.fileUrl) {
            window.open(document.fileUrl, "_blank", "noopener,noreferrer");
        }
    }, [document.fileUrl]);

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
                        onClick={handleView}
                    >
                        <EyeIcon className="h-4 w-4 text-[#0B0E05]" />
                    </DocumentActionButton>
                </div>
            </div>
        </div>
    );
}

/** Compliance review detail modal with document actions and claim controls. */
export default function ComplianceDetailsModal({ userId }: ComplianceDetailsModalProps) {
    const { closeModal, showModal } = useModal();
    const { sessionProfile } = useAdminSessionProfile();
    const detailQuery = useAdminComplianceDetail(userId);
    const claimMutation = useAdminComplianceClaim(userId);
    const unclaimMutation = useAdminComplianceUnclaim(userId);

    const detail = detailQuery.data;
    const profileName = useMemo(
        () => getProfileDisplayName(detail?.firstName, detail?.lastName, detail?.email),
        [detail?.email, detail?.firstName, detail?.lastName],
    );

    const avatarName = useMemo(
        () => [detail?.firstName, detail?.lastName].filter(Boolean).join(" ").trim(),
        [detail?.firstName, detail?.lastName],
    );

    const accountTypeLabel =
        detail?.accountType === "seller" ? "SELLER ACCOUNT" : "BUYER ACCOUNT";
    const reviewStatusClasses = getReviewStatusClasses(detail?.complianceReviewStatus);
    const isAssigned = hasAssignedReviewer(detail?.assignedTo);
    const assignedReviewerLabel = isAssigned ? (detail?.assignedTo ?? "Unassigned") : "Unassigned";
    const isClaimActionPending = claimMutation.isPending || unclaimMutation.isPending;
    const canReviewDocuments = isAssigned;

    const handleClaim = useCallback(() => {
        claimMutation.mutate(sessionProfile?.displayName ?? DEFAULT_ADMIN_DISPLAY_NAME);
    }, [claimMutation, sessionProfile?.displayName]);

    const handleDocumentAction = useCallback(
        (document: ComplianceDocumentRecord, action: "approve" | "reject") => {
            if (!detail) {
                return;
            }

            if (action === "approve") {
                showModal({
                    content: (
                        <ComplianceApproveDocumentModal
                            userId={userId}
                            document={document}
                            verificationType={detail.verificationType}
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
                        verificationType={detail.verificationType}
                    />
                ),
                panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
            });
        },
        [detail, showModal, userId],
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
            <div className="flex h-full w-full flex-col overflow-y-auto bg-white md:h-auto md:max-h-[90vh] md:w-[55%] md:rounded-[13px]">

                <div className="flex items-center justify-between border-b border-[#0B0E0514] px-5 py-3">
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
                    <ModalCloseIcon
                        className="hidden h-5 w-5 cursor-pointer text-[#0B0E05] md:block"
                        onClick={closeModal}
                    />
                </div>

                <div className="flex-1 space-y-6 p-5 md:p-6">
                    {detailQuery.isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-16 rounded-xl bg-[#0B0E050A]" />
                            <div className="h-28 rounded-xl bg-[#0B0E050A]" />
                            <div className="h-40 rounded-xl bg-[#0B0E050A]" />
                        </div>
                    ) : detailQuery.isError && !detail ? (
                        <EmptyDetailState message="Unable to load compliance details." />
                    ) : detail ? (
                        <>
                            <div className="flex flex-col gap-2 rounded-xl border border-[#0B0E0514] bg-[#DC68030A] p-3">
                                <div className="flex items-center gap-2">
                                    <LightbulbIcon className="h-5 w-5 text-[#DC6803]" />
                                    <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                        Reviewer Tip
                                    </Typography>
                                </div>
                                <Typography type="text14" fontWeight={400} className="leading-relaxed text-[#0B0E05]">
                                    Approve only when all documents are verified and clear. Reject only when the
                                    application clearly fails compliance &amp; is irredeemable.
                                </Typography>
                            </div>

                            <div className="flex flex-col justify-between gap-4 border-y border-[#0B0E0514] py-5 md:flex-row md:items-center">
                                <div className="flex flex-1 gap-4 md:border-r md:pr-6">
                                    <ProfileAvatar
                                        size="xxl"
                                        name={avatarName}
                                        email={detail.email}
                                        imageUrl={detail.profilePicture}
                                    />
                                    <div className="flex flex-col">
                                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                            {profileName}
                                        </Typography>
                                        <Typography type="text14" fontWeight={400} className="text-[#0B0E05]">
                                            {detail.email}
                                        </Typography>
                                        <Typography
                                            type="text12"
                                            fontWeight={700}
                                            className={detail.accountType === "seller" ? "text-[#518300]" : "text-[#00A341]"}
                                        >
                                            {accountTypeLabel}
                                        </Typography>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col gap-3 md:items-end">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Typography type="text14" fontWeight={700} className="shrink-0 text-slate-900">
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
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            aria-label="Claim compliance case"
                                            data-testid="compliance-claim-button"
                                            disabled={isAssigned || isClaimActionPending}
                                            onClick={handleClaim}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-transparent bg-[#B1EC52] px-4 py-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {claimMutation.isPending ? (
                                                <span
                                                    className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#0B0E05]/25 border-t-[#0B0E05]"
                                                    aria-hidden
                                                />
                                            ) : null}
                                            <Typography type="text12" fontWeight={700} className="text-[#0B0E05]">
                                                {claimMutation.isPending ? "Claiming..." : "Claim"}
                                            </Typography>
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Unclaim compliance case"
                                            data-testid="compliance-unclaim-button"
                                            disabled={!isAssigned || isClaimActionPending}
                                            onClick={() => unclaimMutation.mutate()}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#0B0E0514] bg-[#FFFFFF] px-4 py-2 transition-colors hover:bg-[#0B0E050A] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {unclaimMutation.isPending ? (
                                                <span
                                                    className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#0B0E05]/25 border-t-[#0B0E05]"
                                                    aria-hidden
                                                />
                                            ) : null}
                                            <Typography type="text12" fontWeight={700} className="text-[#0B0E05]">
                                                {unclaimMutation.isPending ? "Unclaiming..." : "Unclaim"}
                                            </Typography>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <ComplianceSummaryBar
                                detail={detail}
                                reviewStatusClasses={reviewStatusClasses}
                            />

                            <div className="space-y-3">
                                <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                    Uploaded documents
                                </Typography>
                                {detail.documents.map((document) => (
                                    <ComplianceDocumentRow
                                        key={document.id}
                                        document={document}
                                        canReviewDocuments={canReviewDocuments}
                                        onDocumentAction={handleDocumentAction}
                                    />
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function ComplianceSummaryBar({
    detail,
    reviewStatusClasses,
}: {
    detail: {
        complianceReviewStatus: string;
        submittedAt: string;
        documentsApprovedCount: number;
        documentsTotalCount: number;
        complianceUpdatedAt: string;
    };
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
                            {formatReviewStatusLabel(detail.complianceReviewStatus)}
                        </span>
                    </SummaryRow>
                    <SummaryRow label="Submitted" value={formatDisplayDate(detail.submittedAt)} />
                </div>

                <div className="flex flex-col gap-3">
                    <SummaryRow
                        label="Documents approved"
                        value={`${detail.documentsApprovedCount} of ${detail.documentsTotalCount}`}
                    />
                    <SummaryRow label="Last updated" value={formatDisplayDate(detail.complianceUpdatedAt)} />
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
