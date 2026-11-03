"use client";

import Typography from "@/components/typography";
import {
    ApproveCheckIcon,
    ArrowLeftIcon,
    ArrowSquareOutIcon,
    ArrowsClockwiseIcon,
    FileTextIcon,
    ModalCloseIcon,
    RejectXIcon,
    ShieldIcon,
} from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useAdminComplianceDocumentViewingLink } from "@/lib/admin/hooks/use-admin-compliance";
import type {
    ComplianceDocumentRecord,
    ComplianceVerificationType,
} from "@/lib/compliance/types/admin-compliance-detail.types";
import ComplianceApproveDocumentModal from "@/components/modals/compliance-approve-document-modal";
import ComplianceRejectDocumentModal from "@/components/modals/compliance-reject-document-modal";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";
import { toast } from "sonner";
import { useCallback, useMemo, useState } from "react";

interface ComplianceDocumentViewerModalProps {
    userId: string;
    document: ComplianceDocumentRecord;
    verificationType?: ComplianceVerificationType;
    canReview?: boolean;
}

function inferDocumentFormat(document: ComplianceDocumentRecord): string {
    if (document.format?.trim()) {
        return document.format.trim().toLowerCase();
    }

    const fileId = document.fileId?.trim().toLowerCase() || "";
    if (fileId.endsWith(".pdf")) return "pdf";
    if (fileId.endsWith(".png")) return "png";
    if (fileId.endsWith(".jpg") || fileId.endsWith(".jpeg")) return "jpg";
    if (fileId.endsWith(".webp")) return "webp";

    const title = document.title?.trim().toLowerCase() || "";
    if (title.endsWith(".pdf")) return "pdf";
    if (title.endsWith(".png")) return "png";
    if (title.endsWith(".jpg") || title.endsWith(".jpeg")) return "jpg";
    if (title.endsWith(".webp")) return "webp";

    return "pdf";
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
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatusBadgeClasses(status?: string): { bg: string; text: string; label: string } {
    switch (status?.toLowerCase()) {
        case "approved":
            return { bg: "bg-[#00A34114]", text: "text-[#00A341]", label: "Approved" };
        case "rejected":
            return { bg: "bg-[#CC292914]", text: "text-[#CC2929]", label: "Rejected" };
        default:
            return { bg: "bg-[#DC680314]", text: "text-[#DC6803]", label: "Pending Review" };
    }
}

export default function ComplianceDocumentViewerModal({
    userId,
    document,
    verificationType = document.verificationType ?? "kyc",
    canReview = false,
}: ComplianceDocumentViewerModalProps) {
    const { closeModal, showModal } = useModal();
    const [zoomLevel, setZoomLevel] = useState(1);
    const [imageError, setImageError] = useState(false);
    const [viewMode, setViewMode] = useState<"auto" | "image" | "frame">("auto");

    const resolvedFormat = useMemo(() => inferDocumentFormat(document), [document]);
    const isImageFormat = useMemo(
        () => ["jpg", "jpeg", "png", "webp", "gif"].includes(resolvedFormat),
        [resolvedFormat],
    );

    const viewingLinkParams = useMemo(() => {
        if (!document.fileId) {
            return null;
        }
        return {
            file_id: document.fileId,
            format: resolvedFormat,
            type: verificationType,
        };
    }, [document.fileId, resolvedFormat, verificationType]);

    const {
        data: linkData,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useAdminComplianceDocumentViewingLink(viewingLinkParams, Boolean(document.fileId));

    const viewingLink = linkData?.viewingLink || document.fileUrl || "";
    const statusBadge = getStatusBadgeClasses(document.status);
    const isDecided =
        document.status?.toLowerCase() === "approved" ||
        document.status?.toLowerCase() === "rejected";

    const shouldUseImage =
        viewMode === "image" || (viewMode === "auto" && isImageFormat && !imageError);

    const handleOpenExternal = useCallback(() => {
        if (!viewingLink) {
            toast.error("Viewing link is not available yet.");
            return;
        }
        window.open(viewingLink, "_blank", "noopener,noreferrer");
    }, [viewingLink]);

    const handleCopyLink = useCallback(async () => {
        if (!viewingLink) {
            toast.error("Viewing link is not available yet.");
            return;
        }
        try {
            await navigator.clipboard.writeText(viewingLink);
            toast.success("Secure viewing link copied to clipboard.");
        } catch {
            toast.error("Unable to copy link to clipboard.");
        }
    }, [viewingLink]);

    const handleApprove = useCallback(() => {
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
    }, [document, showModal, userId, verificationType]);

    const handleReject = useCallback(() => {
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
    }, [document, showModal, userId, verificationType]);

    const handleRefetch = useCallback(() => {
        setImageError(false);
        refetch();
    }, [refetch]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6">
            <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#FFFFFF] shadow-2xl">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B0E0514] bg-[#FDFDFD] px-5 py-3.5">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-[#0B0E05] hover:opacity-75 md:hidden"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B0E050A]">
                            <FileTextIcon className="h-5 w-5 text-[#0B0E05A3]" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                    {document.title}
                                </Typography>
                                <span className={`inline-block rounded-md px-2 py-0.5 ${statusBadge.bg}`}>
                                    <Typography type="text12" fontWeight={600} className={statusBadge.text}>
                                        {statusBadge.label}
                                    </Typography>
                                </span>
                            </div>
                            <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3]">
                                {document.category} • {verificationType.toUpperCase()}
                            </Typography>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Security notice */}
                        <div className="hidden items-center gap-1.5 rounded-full border border-[#51830026] bg-[#5183000D] px-3 py-1 sm:inline-flex">
                            <ShieldIcon className="h-3.5 w-3.5 text-[#518300]" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#518300]" />
                            <Typography type="text12" fontWeight={600} className="text-[#518300]">
                                Signed Link (2m expiry)
                            </Typography>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefetch}
                            title="Refresh link"
                            disabled={isFetching}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-[#0B0E050A] disabled:opacity-50"
                        >
                            <ArrowsClockwiseIcon
                                className={`h-4 w-4 text-[#0B0E05] ${isFetching ? "animate-spin" : ""}`}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenExternal}
                            title="Open in new tab"
                            disabled={!viewingLink}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-[#0B0E050A] disabled:opacity-50"
                        >
                            <ArrowSquareOutIcon className="h-4 w-4 text-[#0B0E05]" />
                        </button>

                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Close"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] transition-colors hover:bg-[#0B0E050A]"
                        >
                            <ModalCloseIcon className="h-4 w-4 text-[#0B0E05]" />
                        </button>
                    </div>
                </div>

                {/* Body Canvas */}
                <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
                    {/* Document Display Canvas */}
                    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#0B0E0508] p-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#0B0E05]/20 border-t-[#518300]" />
                                <Typography type="text14" fontWeight={600} className="text-[#0B0E05]">
                                    Generating secure viewing link...
                                </Typography>
                                <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3]">
                                    Retrieving signed access credentials from server
                                </Typography>
                            </div>
                        ) : isError && !viewingLink ? (
                            <div className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-[#CC292926] bg-[#FFFFFF] p-6 text-center shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#CC292914]">
                                    <RejectXIcon className="h-6 w-6 text-[#CC2929]" />
                                </div>
                                <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                    Unable to load document link
                                </Typography>
                                <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3]">
                                    {error instanceof Error ? error.message : "The link might have expired."}
                                </Typography>
                                <button
                                    type="button"
                                    onClick={handleRefetch}
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#518300] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                >
                                    <ArrowsClockwiseIcon className="h-3.5 w-3.5" />
                                    Retry Generating Link
                                </button>
                            </div>
                        ) : viewingLink ? (
                            <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-[#FFFFFF]">
                                {shouldUseImage ? (
                                    <div className="relative flex h-full w-full items-center justify-center overflow-auto p-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={viewingLink}
                                            alt={document.title}
                                            onError={() => setImageError(true)}
                                            referrerPolicy="no-referrer"
                                            style={{
                                                transform: `scale(${zoomLevel})`,
                                                transition: "transform 0.15s ease-out",
                                            }}
                                            className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
                                        />
                                        {/* Image Zoom Toolbar */}
                                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#0B0E0514] bg-[#FFFFFF]/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
                                            <button
                                                type="button"
                                                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                                                className="h-7 w-7 rounded-full hover:bg-[#0B0E050A] text-sm font-bold text-[#0B0E05]"
                                                title="Zoom out"
                                            >
                                                −
                                            </button>
                                            <span className="min-w-[48px] text-center text-xs font-semibold text-[#0B0E05]">
                                                {Math.round(zoomLevel * 100)}%
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                                                className="h-7 w-7 rounded-full hover:bg-[#0B0E050A] text-sm font-bold text-[#0B0E05]"
                                                title="Zoom in"
                                            >
                                                +
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setZoomLevel(1)}
                                                className="ml-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-[#518300] hover:bg-[#51830014]"
                                            >
                                                Reset
                                            </button>
                                            <div className="mx-1 h-3 w-px bg-[#0B0E0514]" />
                                            <button
                                                type="button"
                                                onClick={() => setViewMode("frame")}
                                                className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-[#0B0E05A3] hover:bg-[#0B0E050A]"
                                            >
                                                Frame View
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-full w-full">
                                        <iframe
                                            src={viewingLink}
                                            title={document.title}
                                            className="h-full w-full rounded-xl border-0 bg-[#FFFFFF]"
                                        />
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border border-[#0B0E0514] bg-[#FFFFFF]/90 px-2.5 py-1 text-xs shadow-sm backdrop-blur-sm">
                                            <button
                                                type="button"
                                                onClick={() => setViewMode("image")}
                                                className="font-medium text-[#518300] hover:underline"
                                            >
                                                Try Image Mode
                                            </button>
                                            <span className="text-[#0B0E05A3]">|</span>
                                            <button
                                                type="button"
                                                onClick={handleOpenExternal}
                                                className="font-medium text-[#0B0E05] hover:underline"
                                            >
                                                Open Directly
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Metadata & Actions Sidebar */}
                    <div className="flex w-full flex-col justify-between border-t border-[#0B0E0514] bg-[#FFFFFF] p-5 lg:w-80 lg:border-l lg:border-t-0">
                        <div className="space-y-4">
                            <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                Document Information
                            </Typography>

                            <div className="space-y-3 rounded-xl border border-[#0B0E0514] bg-[#FDFDFD] p-3.5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-medium text-[#0B0E05A3]">Category</span>
                                    <span className="text-sm font-semibold text-[#0B0E05]">
                                        {document.category}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-medium text-[#0B0E05A3]">Submitted At</span>
                                    <span className="text-sm font-semibold text-[#0B0E05]">
                                        {formatDisplayDate(document.submittedAt)}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-medium text-[#0B0E05A3]">Format</span>
                                    <span className="text-sm font-semibold uppercase text-[#0B0E05]">
                                        {resolvedFormat}
                                    </span>
                                </div>
                                {document.fileId ? (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-medium text-[#0B0E05A3]">Cloudinary Public ID</span>
                                        <span className="truncate font-mono text-xs text-[#0B0E05]" title={document.fileId}>
                                            {document.fileId}
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={handleOpenExternal}
                                    disabled={!viewingLink}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#0B0E05] transition-colors hover:bg-[#0B0E050A] disabled:opacity-50"
                                >
                                    <ArrowSquareOutIcon className="h-4 w-4 text-[#0B0E05]" />
                                    Open original in new tab
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    disabled={!viewingLink}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#0B0E05] transition-colors hover:bg-[#0B0E050A] disabled:opacity-50"
                                >
                                    Copy signed viewing link
                                </button>
                            </div>
                        </div>

                        {/* Review CTAs inside viewer */}
                        {canReview && !isDecided ? (
                            <div className="mt-4 space-y-2 border-t border-[#0B0E0514] pt-4">
                                <Typography type="text12" fontWeight={700} className="text-[#0B0E05A3]">
                                    Review this document
                                </Typography>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={handleApprove}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#00A34133] bg-[#00A34114] px-3 py-2 text-xs font-bold text-[#00A341] transition-colors hover:bg-[#00A34129]"
                                    >
                                        <ApproveCheckIcon className="h-3.5 w-3.5" />
                                        Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReject}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#CC292933] bg-[#CC292914] px-3 py-2 text-xs font-bold text-[#CC2929] transition-colors hover:bg-[#CC292929]"
                                    >
                                        <RejectXIcon className="h-3.5 w-3.5" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
