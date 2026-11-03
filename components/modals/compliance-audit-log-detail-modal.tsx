"use client";

import { ProfileAvatar } from "@/components/profile-avatar";
import Typography from "@/components/typography";
import {
    ArrowSquareOutIcon,
    ArrowsClockwiseIcon,
    CalendarDotsIcon,
    CheckCircleIcon,
    ClockIcon,
    CopyIcon,
    FileTextIcon,
    ModalCloseIcon,
    RejectXIcon,
    ShieldIcon,
    WarningIcon,
} from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useAdminComplianceDocumentViewingLink } from "@/lib/admin/hooks/use-admin-compliance";
import type {
    AdminComplianceAuditDocumentPreview,
    AdminComplianceAuditLogRecord,
} from "@/lib/compliance/types/admin-compliance-audit.types";
import {
    buildCloudinaryDocumentUrl,
} from "@/lib/compliance/utilities/build-cloudinary-document-url";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ComplianceAuditLogDetailModalProps {
    log: AdminComplianceAuditLogRecord;
}

function getActionBadgeClasses(action: string): { bg: string; text: string; dot: string } {
    switch (action?.toLowerCase()) {
        case "review:approve":
        case "restore":
        case "add":
        case "claim":
            return { bg: "bg-[#00A34114] border border-[#00A34133]", text: "text-[#00A341]", dot: "bg-[#00A341]" };
        case "review:reject":
        case "delete":
        case "revoke":
            return { bg: "bg-[#CC292914] border border-[#CC292933]", text: "text-[#CC2929]", dot: "bg-[#CC2929]" };
        case "review:suspend":
        case "unclaim":
            return { bg: "bg-[#DC680314] border border-[#DC680333]", text: "text-[#DC6803]", dot: "bg-[#DC6803]" };
        case "update":
        case "submit":
        case "resend":
            return { bg: "bg-[#2563EB14] border border-[#2563EB33]", text: "text-[#2563EB]", dot: "bg-[#2563EB]" };
        default:
            return { bg: "bg-[#0B0E050A] border border-[#0B0E0514]", text: "text-[#0B0E05CC]", dot: "bg-[#0B0E0580]" };
    }
}

function formatStatusLabel(status: string): string {
    if (!status) {
        return "—";
    }

    return status.replace(/_/g, " ");
}

function formatBytes(bytes?: number): string {
    if (!bytes || Number.isNaN(bytes) || bytes <= 0) {
        return "";
    }
    if (bytes >= 1048576) {
        return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
}

function CopyableBadge({ text, label }: { text?: string | null; label: string }) {
    if (!text) return null;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Unable to copy ${label.toLowerCase()}`);
        }
    };

    const display = text.length > 18 ? `${text.slice(0, 8)}…${text.slice(-6)}` : text;

    return (
        <button
            type="button"
            onClick={handleCopy}
            title={`Copy ${label}: ${text}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#0B0E0514] bg-[#0B0E0505] px-2 py-0.5 font-mono text-[11px] text-[#0B0E05A3] transition hover:bg-[#0B0E050F] hover:text-[#0B0E05]"
        >
            <span>{display}</span>
            <CopyIcon className="h-3 w-3 shrink-0 opacity-70" />
        </button>
    );
}

function PersonCard({
    label,
    name,
    email,
    imageUrl,
    role,
    id,
}: {
    label: string;
    name: string;
    email?: string;
    imageUrl?: string;
    role: string;
    id?: string | null;
}) {
    return (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#0B0E0514] bg-white p-4 shadow-2xs">
            <div className="flex items-start justify-between gap-2">
                <Typography type="text12" fontWeight={600} className="uppercase tracking-wider !text-[#0B0E0573]">
                    {label}
                </Typography>
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        role.toLowerCase() === "admin"
                            ? "bg-[#51830014] text-[#518300]"
                            : "bg-[#0B0E050A] text-[#0B0E05A3]"
                    }`}
                >
                    {role.toLowerCase() === "admin" ? <ShieldIcon className="h-3 w-3" /> : null}
                    {role}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <ProfileAvatar name={name || "User"} email={email} imageUrl={imageUrl} size="md" />
                <div className="min-w-0 flex-1">
                    <Typography type="text14" fontWeight={700} className="truncate !text-[#0B0E05]">
                        {name || "—"}
                    </Typography>
                    <Typography type="text12" fontWeight={500} className="truncate !text-[#0B0E05A3]">
                        {email || "No email on record"}
                    </Typography>
                </div>
            </div>

            {id ? (
                <div className="flex items-center justify-between border-t border-[#0B0E050A] pt-2.5">
                    <span className="text-[11px] font-medium text-[#0B0E0573]">ID</span>
                    <CopyableBadge text={id} label={`${label} ID`} />
                </div>
            ) : null}
        </div>
    );
}

function InAppDocumentPreview({
    document,
    onExpand,
    onViewingLinkResolved,
}: {
    document: AdminComplianceAuditDocumentPreview;
    onExpand: () => void;
    onViewingLinkResolved?: (url: string) => void;
}) {
    const [candidateIndex, setCandidateIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [viewMode, setViewMode] = useState<"auto" | "image" | "frame">("auto");

    const viewingLinkParams = useMemo(() => {
        const fileId = document.fileId?.trim() || document.id?.trim();
        if (!fileId) {
            return null;
        }

        return {
            file_id: fileId,
            format: document.format || "jpg",
            type: (document.verificationType ?? "kyc") as "kyc" | "kyb",
        };
    }, [document.fileId, document.id, document.format, document.verificationType]);

    const {
        data: linkData,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useAdminComplianceDocumentViewingLink(
        viewingLinkParams,
        Boolean(viewingLinkParams?.file_id),
    );

    const signedViewingLink = linkData?.viewingLink ?? "";

    useEffect(() => {
        if (signedViewingLink && onViewingLinkResolved) {
            onViewingLinkResolved(signedViewingLink);
        }
    }, [signedViewingLink, onViewingLinkResolved]);

    // Build fallback direct Cloudinary URL
    const directCloudinaryUrl = useMemo(() => {
        if (!document.fileId) return "";
        return buildCloudinaryDocumentUrl(document.fileId, document.format);
    }, [document.fileId, document.format]);

    const candidates = useMemo(() => {
        return [
            signedViewingLink,
            directCloudinaryUrl,
            document.previewUrl,
            document.openUrl,
            ...(document.previewCandidates ?? []),
        ].filter((url, index, list): url is string => Boolean(url) && list.indexOf(url) === index);
    }, [signedViewingLink, directCloudinaryUrl, document.previewUrl, document.openUrl, document.previewCandidates]);

    const activeUrl = candidates[candidateIndex] || signedViewingLink || directCloudinaryUrl || document.previewUrl || "";
    const isPdf =
        (document.format ?? "").toLowerCase() === "pdf" ||
        activeUrl.toLowerCase().includes(".pdf");
    const isFrameMode =
        viewMode === "frame" || (viewMode === "auto" && isPdf && !imageError);

    const canShowContent = Boolean(activeUrl) && !imageError;
    const isDirectFallback = !signedViewingLink && Boolean(activeUrl) && activeUrl === directCloudinaryUrl;

    const handleImageError = () => {
        const nextIndex = candidateIndex + 1;
        if (nextIndex < candidates.length) {
            setCandidateIndex(nextIndex);
            setLoaded(false);
            return;
        }

        setImageError(true);
        setLoaded(true);
    };

    const handleCopyLink = useCallback(async () => {
        const target = activeUrl || document.fileId || "";
        if (!target) {
            toast.error("Document reference is not available.");
            return;
        }

        try {
            await navigator.clipboard.writeText(target);
            toast.success(activeUrl ? "Document link copied to clipboard." : "File ID copied to clipboard.");
        } catch {
            toast.error("Unable to copy to clipboard.");
        }
    }, [activeUrl, document.fileId]);

    const handleOpenExternal = useCallback(() => {
        if (!activeUrl) {
            toast.error("Viewing link is not available.");
            return;
        }

        window.open(activeUrl, "_blank", "noopener,noreferrer");
    }, [activeUrl]);

    const handleRefresh = useCallback(async () => {
        setImageError(false);
        setCandidateIndex(0);
        setLoaded(false);
        await refetch();
        toast.success("Refreshed viewing link.");
    }, [refetch]);

    const byteSizeFormatted = formatBytes(document.bytes);

    return (
        <div className="overflow-hidden rounded-xl border border-[#0B0E0514] bg-[#0B0E0505] shadow-xs">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B0E050F] bg-white px-4 py-3">
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Typography type="text14" fontWeight={700} className="truncate !text-[#0B0E05]">
                            {document.typeLabel || "Document"}
                        </Typography>

                        {signedViewingLink ? (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#00A34126] bg-[#00A3410D] px-2.5 py-0.5"
                                title="Cloudinary signed time-limited viewing link (2-minute expiration)"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00A341] opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00A341]" />
                                </span>
                                <Typography type="text12" fontWeight={600} className="!text-[#00A341]">
                                    Signed Link (2m expiry)
                                </Typography>
                            </span>
                        ) : isDirectFallback ? (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#2563EB26] bg-[#2563EB0D] px-2.5 py-0.5"
                                title="Signed link unavailable (Invalid file id from storage) · Showing direct Cloudinary asset preview"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                                <Typography type="text12" fontWeight={600} className="!text-[#2563EB]">
                                    Direct Asset Preview
                                </Typography>
                            </span>
                        ) : null}
                    </div>

                    <div className="block w-full">
                        <Typography type="text12" fontWeight={400} className="truncate !text-[#0B0E05A3]">
                            {document.filename}
                            {document.format ? ` · ${document.format.toUpperCase()}` : ""}
                            {document.status ? ` · ${formatStatusLabel(document.status)}` : ""}
                            {byteSizeFormatted ? ` · ${byteSizeFormatted}` : ""}
                        </Typography>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isFetching}
                        title="Refresh secure viewing link"
                        aria-label="Refresh secure viewing link"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B0E0514] bg-white transition hover:bg-[#0B0E050A] disabled:opacity-50"
                    >
                        <ArrowsClockwiseIcon
                            className={`h-3.5 w-3.5 text-[#0B0E05] ${isFetching ? "animate-spin" : ""}`}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={handleCopyLink}
                        title="Copy secure link"
                        aria-label="Copy secure link"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B0E0514] bg-white transition hover:bg-[#0B0E050A] disabled:opacity-50"
                    >
                        <CopyIcon className="h-3.5 w-3.5 text-[#0B0E05]" />
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenExternal}
                        disabled={!activeUrl}
                        title="Open in new tab"
                        aria-label="Open in new tab"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B0E0514] bg-white transition hover:bg-[#0B0E050A] disabled:opacity-50"
                    >
                        <ArrowSquareOutIcon className="h-3.5 w-3.5 text-[#0B0E05]" />
                    </button>

                    {canShowContent ? (
                        <button
                            type="button"
                            onClick={onExpand}
                            aria-label="Expand"
                            className="rounded-lg border border-[#0B0E0514] bg-white px-2.5 py-1.5 transition hover:bg-[#0B0E050A]"
                        >
                            <Typography type="text12" fontWeight={600} className="!text-[#0B0E05]">
                                Expand
                            </Typography>
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Document Body Canvas */}
            <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden bg-[#0B0E0506]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                        <div className="relative flex h-12 w-12 items-center justify-center">
                            <div className="absolute h-12 w-12 animate-ping rounded-full bg-[#518300]/20" />
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0B0E0514] border-t-[#518300]" />
                        </div>
                        <div className="space-y-1">
                            <Typography type="text14" fontWeight={600} className="!text-[#0B0E05]">
                                Requesting secure document link...
                            </Typography>
                            <Typography type="text12" fontWeight={400} className="!text-[#0B0E05A3]">
                                Contacting compliance viewing service
                            </Typography>
                        </div>
                    </div>
                ) : canShowContent ? (
                    isFrameMode ? (
                        <div className="relative h-[420px] w-full">
                            <iframe
                                src={activeUrl}
                                title={document.filename}
                                className="h-full w-full border-0 bg-white"
                            />
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("image")}
                                    className="rounded-lg border border-[#0B0E0514] bg-white/90 px-2.5 py-1 text-xs font-medium text-[#0B0E05] shadow-xs backdrop-blur-sm hover:bg-white"
                                >
                                    Switch to Image Mode
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex min-h-[300px] max-h-[460px] w-full items-center justify-center overflow-auto p-4">
                            {!loaded ? (
                                <div className="flex min-h-[260px] items-center justify-center">
                                    <div className="h-8 w-8 animate-pulse rounded-full bg-[#0B0E0514]" />
                                </div>
                            ) : null}
                            <div
                                className={`relative flex items-center justify-center transition-transform duration-150 ease-out ${
                                    loaded ? "opacity-100" : "absolute opacity-0"
                                }`}
                                style={{
                                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    key={activeUrl}
                                    src={activeUrl}
                                    alt={document.filename}
                                    className="max-h-[380px] w-auto max-w-full cursor-zoom-in rounded-lg object-contain shadow-xs"
                                    onClick={onExpand}
                                    onLoad={() => setLoaded(true)}
                                    onError={handleImageError}
                                />
                            </div>

                            {/* Floating Canvas Controls */}
                            {loaded ? (
                                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#0B0E0514] bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setZoomLevel((z) =>
                                                Math.max(0.5, Number((z - 0.25).toFixed(2))),
                                            )
                                        }
                                        disabled={zoomLevel <= 0.5}
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-[#0B0E05] transition hover:bg-[#0B0E050A] disabled:opacity-30"
                                        title="Zoom out"
                                        aria-label="Zoom out"
                                    >
                                        −
                                    </button>
                                    <span className="min-w-[44px] text-center text-xs font-semibold tabular-nums text-[#0B0E05]">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setZoomLevel((z) =>
                                                Math.min(3, Number((z + 0.25).toFixed(2))),
                                            )
                                        }
                                        disabled={zoomLevel >= 3}
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-[#0B0E05] transition hover:bg-[#0B0E050A] disabled:opacity-30"
                                        title="Zoom in"
                                        aria-label="Zoom in"
                                    >
                                        +
                                    </button>
                                    <div className="mx-0.5 h-3.5 w-px bg-[#0B0E0514]" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setZoomLevel(1);
                                            setRotation(0);
                                        }}
                                        className="rounded px-2 py-0.5 text-[11px] font-semibold text-[#518300] transition hover:bg-[#51830014]"
                                        title="Reset zoom & rotation"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRotation((r) => (r + 90) % 360)}
                                        className="rounded px-2 py-0.5 text-[11px] font-semibold text-[#0B0E05A3] transition hover:bg-[#0B0E050A]"
                                        title="Rotate 90 degrees"
                                    >
                                        Rotate
                                    </button>
                                    {isPdf ? (
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("frame")}
                                            className="rounded px-2 py-0.5 text-[11px] font-semibold text-[#0B0E05A3] transition hover:bg-[#0B0E050A]"
                                        >
                                            PDF View
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    )
                ) : (
                    /* Fallback Document Card when image/viewing link is not directly renderable */
                    <div className="flex max-w-md flex-col items-center justify-center gap-3.5 rounded-2xl border border-[#0B0E0514] bg-white p-6 text-center shadow-xs">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B0E0508]">
                            <FileTextIcon className="h-7 w-7 text-[#0B0E05A3]" />
                        </div>
                        <div className="space-y-1">
                            <Typography type="text14" fontWeight={700} className="!text-[#0B0E05]">
                                {document.typeLabel || "Compliance Document"}
                            </Typography>
                            <Typography type="text12" fontWeight={400} className="!text-[#0B0E05A3]">
                                {isError
                                    ? "Viewing link unavailable from storage (Invalid file id). Asset may not exist in Cloudinary bucket."
                                    : "Document reference stored in audit record."}
                            </Typography>
                        </div>

                        <div className="w-full space-y-1.5 rounded-lg border border-[#0B0E050F] bg-[#0B0E0505] p-3 text-left">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#0B0E0573]">Original File:</span>
                                <span className="font-mono font-medium text-[#0B0E05]">{document.filename}</span>
                            </div>
                            {document.fileId ? (
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#0B0E0573]">File ID:</span>
                                    <CopyableBadge text={document.fileId} label="File ID" />
                                </div>
                            ) : null}
                            {byteSizeFormatted ? (
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#0B0E0573]">Size:</span>
                                    <span className="font-medium text-[#0B0E05]">{byteSizeFormatted}</span>
                                </div>
                            ) : null}
                        </div>

                        {directCloudinaryUrl ? (
                            <a
                                href={directCloudinaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#518300] hover:underline"
                            >
                                Test Direct Cloudinary Link
                                <ArrowSquareOutIcon className="h-3.5 w-3.5" />
                            </a>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}

function DocumentLightbox({
    document,
    viewingLink,
    onClose,
}: {
    document: AdminComplianceAuditDocumentPreview;
    viewingLink?: string;
    onClose: () => void;
}) {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [viewMode, setViewMode] = useState<"auto" | "image" | "frame">("auto");

    const viewingLinkParams = useMemo(() => {
        const fileId = document.fileId?.trim() || document.id?.trim();
        if (!fileId) {
            return null;
        }

        return {
            file_id: fileId,
            format: document.format || "jpg",
            type: (document.verificationType ?? "kyc") as "kyc" | "kyb",
        };
    }, [document.fileId, document.id, document.format, document.verificationType]);

    const { data: linkData } = useAdminComplianceDocumentViewingLink(
        viewingLinkParams,
        !viewingLink && Boolean(viewingLinkParams?.file_id),
    );

    const directCloudinaryUrl = useMemo(() => {
        if (!document.fileId) return "";
        return buildCloudinaryDocumentUrl(document.fileId, document.format);
    }, [document.fileId, document.format]);

    const activeUrl =
        viewingLink ||
        linkData?.viewingLink ||
        directCloudinaryUrl ||
        document.previewUrl ||
        document.openUrl ||
        "";

    const isPdf =
        (document.format ?? "").toLowerCase() === "pdf" ||
        activeUrl.toLowerCase().includes(".pdf");
    const isFrameMode = viewMode === "frame" || (viewMode === "auto" && isPdf);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleCopyLink = useCallback(async () => {
        const target = activeUrl || document.fileId || "";
        if (!target) {
            toast.error("Viewing link is not available.");
            return;
        }

        try {
            await navigator.clipboard.writeText(target);
            toast.success("Document link copied to clipboard.");
        } catch {
            toast.error("Unable to copy link to clipboard.");
        }
    }, [activeUrl, document.fileId]);

    const handleOpenExternal = useCallback(() => {
        if (!activeUrl) return;
        window.open(activeUrl, "_blank", "noopener,noreferrer");
    }, [activeUrl]);

    return (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#0B0E05F2] backdrop-blur-md">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
                <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Typography type="text16" fontWeight={700} className="truncate !text-white">
                            {document.typeLabel || "Document"}
                        </Typography>
                        {activeUrl ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#00A341]" />
                                <span className="text-[11px] font-semibold text-white/90">
                                    Signed Link
                                </span>
                            </span>
                        ) : null}
                    </div>
                    <Typography type="text12" fontWeight={400} className="truncate !text-white/70">
                        {document.filename}
                        {document.format ? ` · ${document.format.toUpperCase()}` : ""}
                    </Typography>
                </div>

                <div className="flex items-center gap-2">
                    {!isFrameMode && activeUrl ? (
                        <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-1">
                            <button
                                type="button"
                                onClick={() =>
                                    setZoomLevel((z) =>
                                        Math.max(0.5, Number((z - 0.25).toFixed(2))),
                                    )
                                }
                                disabled={zoomLevel <= 0.5}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-30"
                                title="Zoom out"
                            >
                                −
                            </button>
                            <span className="min-w-[42px] text-center text-xs font-semibold tabular-nums text-white">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setZoomLevel((z) =>
                                        Math.min(4, Number((z + 0.25).toFixed(2))),
                                    )
                                }
                                disabled={zoomLevel >= 4}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-30"
                                title="Zoom in"
                            >
                                +
                            </button>
                            <div className="mx-1 h-3.5 w-px bg-white/20" />
                            <button
                                type="button"
                                onClick={() => {
                                    setZoomLevel(1);
                                    setRotation(0);
                                }}
                                className="rounded px-2 py-0.5 text-[11px] font-semibold text-[#B1EC52] transition hover:bg-white/10"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={() => setRotation((r) => (r + 90) % 360)}
                                className="rounded px-2 py-0.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
                            >
                                Rotate
                            </button>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={handleCopyLink}
                        title="Copy secure link"
                        aria-label="Copy secure link"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                    >
                        <CopyIcon className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenExternal}
                        title="Open in new tab"
                        aria-label="Open in new tab"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                    >
                        <ArrowSquareOutIcon className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close document preview"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition hover:bg-white/20"
                    >
                        <ModalCloseIcon className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>

            {/* Lightbox Content */}
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
                {isFrameMode ? (
                    <iframe
                        src={activeUrl}
                        title={document.filename}
                        className="h-full w-full max-w-5xl rounded-xl border-0 bg-white shadow-2xl"
                    />
                ) : (
                    <div
                        className="flex items-center justify-center transition-transform duration-150 ease-out"
                        style={{
                            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={activeUrl}
                            alt={document.filename}
                            className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ComplianceAuditLogDetailModal({ log }: ComplianceAuditLogDetailModalProps) {
    const { closeModal } = useModal();
    const actionBadge = getActionBadgeClasses(log.action ?? "");
    const documents = log.documents ?? [];
    const [activeTab, setActiveTab] = useState<"details" | "json">("details");
    const [activeDocumentId, setActiveDocumentId] = useState(documents[0]?.id ?? "");
    const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);
    const [resolvedViewingLinks, setResolvedViewingLinks] = useState<Record<string, string>>({});

    const activeDocument =
        documents.find((document) => document.id === activeDocumentId) ?? documents[0] ?? null;
    const expandedDocument =
        documents.find((document) => document.id === expandedDocumentId) ?? null;

    const handleViewingLinkResolved = useCallback((docId: string, url: string) => {
        setResolvedViewingLinks((prev) => {
            if (prev[docId] === url) return prev;
            return { ...prev, [docId]: url };
        });
    }, []);

    const handleCopyJson = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(log, null, 2));
            toast.success("Raw backend payload copied to clipboard");
        } catch {
            toast.error("Unable to copy JSON");
        }
    }, [log]);

    // Extract state transitions
    const statusBefore =
        log.statusBefore ||
        log.beforeData?.kyc?.status ||
        log.beforeData?.kyb?.status ||
        log.beforeData?.assignment?.status ||
        log.beforeData?.document?.status ||
        "";

    const statusAfter =
        log.statusAfter ||
        log.afterData?.kyc?.status ||
        log.afterData?.kyb?.status ||
        log.afterData?.assignment?.status ||
        log.afterData?.document?.status ||
        "";

    const assignmentBefore =
        log.assignmentBefore ||
        log.beforeData?.assignment?.status ||
        "";

    const assignmentAfter =
        log.assignmentAfter ||
        log.afterData?.assignment?.status ||
        "";

    const rejectionReason =
        log.rejectionReason ||
        log.afterData?.kyc?.rejectionReason ||
        log.afterData?.kyb?.rejectionReason ||
        log.afterData?.document?.rejectionReason ||
        "";

    const httpMetadata = log.metadata;

    return (
        <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B0E0514] px-5 py-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 ${actionBadge.bg}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${actionBadge.dot}`} />
                            <Typography type="text12" fontWeight={700} className={actionBadge.text}>
                                {log.actionLabel || log.action}
                            </Typography>
                        </span>

                        <span className="inline-flex rounded-md border border-[#0B0E0514] bg-[#0B0E0505] px-2 py-0.5">
                            <Typography type="text12" fontWeight={600} className="!text-[#0B0E05CC]">
                                {log.subjectLabel || log.subjectType}
                            </Typography>
                        </span>

                        <div className="flex items-center gap-1 text-[#0B0E05A3]">
                            <CalendarDotsIcon className="h-3.5 w-3.5" />
                            <Typography type="text12" fontWeight={500} className="!text-[#0B0E05A3]">
                                {log.createdAtExact || log.createdAt}
                            </Typography>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Typography type="text16" fontWeight={700} className="!text-[#0B0E05]">
                            {log.eventLabel || `${log.actionLabel || log.action} ${log.subjectLabel || log.subjectType}`}
                        </Typography>
                        {log.id ? (
                            <CopyableBadge text={log.id} label="Event ID" />
                        ) : null}
                    </div>

                    {log.narrative ? (
                        <Typography type="text14" fontWeight={400} className="!text-[#0B0E05A3]">
                            {log.narrative}
                        </Typography>
                    ) : null}
                </div>

                {/* View Switcher & Close Button */}
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-[#0B0E0514] bg-[#0B0E0508] p-0.5">
                        <button
                            type="button"
                            onClick={() => setActiveTab("details")}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                activeTab === "details"
                                    ? "bg-white text-[#0B0E05] shadow-xs"
                                    : "text-[#0B0E05A3] hover:text-[#0B0E05]"
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("json")}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                activeTab === "json"
                                    ? "bg-white text-[#0B0E05] shadow-xs"
                                    : "text-[#0B0E05A3] hover:text-[#0B0E05]"
                            }`}
                        >
                            Raw JSON
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close audit details"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#0B0E0514] bg-white transition hover:bg-[#0B0E050A]"
                    >
                        <ModalCloseIcon className="h-4 w-4 text-[#0B0E05]" />
                    </button>
                </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {activeTab === "json" ? (
                    /* Raw JSON View - Returns exact untouched backend data */
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Typography type="text12" fontWeight={600} className="uppercase tracking-wider !text-[#0B0E0573]">
                                Exact Server Response Payload
                            </Typography>
                            <button
                                type="button"
                                onClick={handleCopyJson}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B0E0514] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B0E05] shadow-xs hover:bg-[#0B0E0508]"
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                Copy JSON
                            </button>
                        </div>
                        <pre className="max-h-[500px] overflow-auto rounded-xl border border-[#0B0E0514] bg-[#0B0E05] p-4 font-mono text-xs text-[#B1EC52] shadow-inner">
                            {JSON.stringify(log, null, 2)}
                        </pre>
                    </div>
                ) : (
                    /* Visual Overview Tab */
                    <>
                        {/* Section 1: Performed By & Affected User Cards */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <PersonCard
                                label="Performed by"
                                name={log.actorName || `${log.actorAdmin?.firstName ?? ""} ${log.actorAdmin?.lastName ?? ""}`.trim()}
                                email={log.actorEmail || log.actorAdmin?.email || log.actorUser?.email}
                                imageUrl={log.actorAvatarUrl || log.actorAdmin?.profilePicture || undefined}
                                role={log.actorTypeLabel || (log.actorAdmin ? "Admin" : "User")}
                                id={log.actorAdminId || log.actorAdmin?.id || log.actorUserId}
                            />
                            <PersonCard
                                label="Affected user"
                                name={log.targetUserName || `${log.targetUser?.firstName ?? ""} ${log.targetUser?.lastName ?? ""}`.trim()}
                                email={log.targetUserEmail || log.targetUser?.email}
                                imageUrl={log.targetUserAvatarUrl || log.targetUser?.profilePicture || undefined}
                                role="User"
                                id={log.targetUserId || log.targetUser?.id}
                            />
                        </div>

                        {/* Section 2: Rejection Reason Alert if Present */}
                        {rejectionReason ? (
                            <div className="flex items-start gap-3 rounded-xl border border-[#CC292926] bg-[#CC29290A] p-3.5">
                                <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#CC2929]" />
                                <div className="space-y-1">
                                    <Typography type="text12" fontWeight={700} className="uppercase tracking-wider !text-[#CC2929]">
                                        Rejection Reason
                                    </Typography>
                                    <Typography type="text14" fontWeight={600} className="!text-[#CC2929]">
                                        {rejectionReason}
                                    </Typography>
                                </div>
                            </div>
                        ) : null}

                        {/* Section 3: State Transition / Audit Diff */}
                        <div className="rounded-xl border border-[#0B0E0514] bg-white p-4 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-[#0B0E050F] pb-2">
                                <Typography type="text12" fontWeight={600} className="uppercase tracking-wider !text-[#0B0E0573]">
                                    State Transition
                                </Typography>
                                <Typography type="text12" fontWeight={500} className="!text-[#0B0E0580]">
                                    Audit Comparison
                                </Typography>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div>
                                    <Typography type="text12" fontWeight={500} className="!text-[#0B0E0573]">
                                        Subject Record
                                    </Typography>
                                    <Typography type="text14" fontWeight={700} className="capitalize !text-[#0B0E05]">
                                        {log.subjectLabel || log.subjectType || "—"}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography type="text12" fontWeight={500} className="!text-[#0B0E0573]">
                                        Status Transition
                                    </Typography>
                                    {statusBefore || statusAfter ? (
                                        <div className="flex items-center gap-1.5 pt-0.5 text-xs font-semibold">
                                            {statusBefore ? (
                                                <span className="rounded bg-[#0B0E050A] px-2 py-0.5 capitalize text-[#0B0E05A3]">
                                                    {formatStatusLabel(statusBefore)}
                                                </span>
                                            ) : null}
                                            {statusBefore && statusAfter && statusBefore !== statusAfter ? (
                                                <span className="text-[#0B0E0573]">→</span>
                                            ) : null}
                                            {statusAfter ? (
                                                <span className="rounded bg-[#00A34114] px-2 py-0.5 capitalize text-[#00A341]">
                                                    {formatStatusLabel(statusAfter)}
                                                </span>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <Typography type="text14" fontWeight={600} className="!text-[#0B0E05A3]">
                                            —
                                        </Typography>
                                    )}
                                </div>

                                <div>
                                    <Typography type="text12" fontWeight={500} className="!text-[#0B0E0573]">
                                        Assignment
                                    </Typography>
                                    {assignmentBefore || assignmentAfter ? (
                                        <div className="flex items-center gap-1.5 pt-0.5 text-xs font-semibold">
                                            {assignmentBefore ? (
                                                <span className="rounded bg-[#0B0E050A] px-2 py-0.5 capitalize text-[#0B0E05A3]">
                                                    {formatStatusLabel(assignmentBefore)}
                                                </span>
                                            ) : null}
                                            {assignmentBefore && assignmentAfter && assignmentBefore !== assignmentAfter ? (
                                                <span className="text-[#0B0E0573]">→</span>
                                            ) : null}
                                            {assignmentAfter ? (
                                                <span className="rounded bg-[#2563EB14] px-2 py-0.5 capitalize text-[#2563EB]">
                                                    {formatStatusLabel(assignmentAfter)}
                                                </span>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <Typography type="text14" fontWeight={600} className="!text-[#0B0E05A3]">
                                            —
                                        </Typography>
                                    )}
                                </div>

                                <div>
                                    <Typography type="text12" fontWeight={500} className="!text-[#0B0E0573]">
                                        Assignee / Reviewer
                                    </Typography>
                                    <Typography type="text14" fontWeight={700} className="truncate !text-[#0B0E05]">
                                        {log.assigneeName || log.actorName || "—"}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Attached Documents (if present) */}
                        {activeDocument ? (
                            <section className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Typography type="text12" fontWeight={600} className="uppercase tracking-wider !text-[#0B0E0573]">
                                        Attached Documents ({documents.length})
                                    </Typography>
                                </div>

                                {documents.length > 1 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {documents.map((document) => {
                                            const isActive = document.id === activeDocument.id;
                                            const sizeStr = formatBytes(document.bytes);

                                            return (
                                                <button
                                                    key={document.id}
                                                    type="button"
                                                    onClick={() => setActiveDocumentId(document.id)}
                                                    className={`rounded-lg border px-3 py-1.5 transition-colors ${
                                                        isActive
                                                            ? "border-[#518300] bg-[#B1EC5233]"
                                                            : "border-[#0B0E0514] bg-white hover:bg-[#0B0E050A]"
                                                    }`}
                                                >
                                                    <Typography type="text12" fontWeight={600} className="!text-[#0B0E05]">
                                                        {document.typeLabel || document.filename}
                                                    </Typography>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : null}

                                <InAppDocumentPreview
                                    key={activeDocument.id}
                                    document={activeDocument}
                                    onExpand={() => setExpandedDocumentId(activeDocument.id)}
                                    onViewingLinkResolved={(url) =>
                                        handleViewingLinkResolved(activeDocument.id, url)
                                    }
                                />
                            </section>
                        ) : null}

                        {/* Section 5: HTTP & Network Metadata */}
                        {httpMetadata && (httpMetadata.method || httpMetadata.path || httpMetadata.ip) ? (
                            <div className="rounded-xl border border-[#0B0E0514] bg-[#0B0E0505] p-3.5 space-y-2">
                                <Typography type="text12" fontWeight={600} className="uppercase tracking-wider !text-[#0B0E0573]">
                                    Request & Network Metadata
                                </Typography>
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    {httpMetadata.method ? (
                                        <span className="rounded bg-[#0B0E05] px-2 py-0.5 font-mono font-bold text-white">
                                            {httpMetadata.method}
                                        </span>
                                    ) : null}
                                    {httpMetadata.path ? (
                                        <div className="flex items-center gap-1 font-mono text-[#0B0E05]">
                                            <span className="font-medium text-[#0B0E0573]">Path:</span>
                                            <span className="rounded bg-white px-2 py-0.5 border border-[#0B0E0514]">{httpMetadata.path}</span>
                                        </div>
                                    ) : null}
                                    {httpMetadata.ip ? (
                                        <div className="flex items-center gap-1 font-mono text-[#0B0E05]">
                                            <span className="font-medium text-[#0B0E0573]">IP:</span>
                                            <span className="rounded bg-white px-2 py-0.5 border border-[#0B0E0514]">{httpMetadata.ip}</span>
                                        </div>
                                    ) : null}
                                </div>
                                {httpMetadata.userAgent ? (
                                    <div className="truncate font-mono text-[11px] text-[#0B0E0573]" title={httpMetadata.userAgent}>
                                        User-Agent: {httpMetadata.userAgent}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </>
                )}
            </div>

            {expandedDocument ? (
                <DocumentLightbox
                    document={expandedDocument}
                    viewingLink={resolvedViewingLinks[expandedDocument.id]}
                    onClose={() => setExpandedDocumentId(null)}
                />
            ) : null}
        </div>
    );
}
