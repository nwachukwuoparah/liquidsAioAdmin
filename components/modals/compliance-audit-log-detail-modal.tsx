"use client";

import { ProfileAvatar } from "@/components/profile-avatar";
import Typography from "@/components/typography";
import { FileTextIcon, ModalCloseIcon } from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import type {
    AdminComplianceAuditDocumentPreview,
    AdminComplianceAuditLogRecord,
} from "@/lib/compliance/types/admin-compliance-audit.types";
import { useState } from "react";

interface ComplianceAuditLogDetailModalProps {
    log: AdminComplianceAuditLogRecord;
};

function getActionBadgeClasses(action: string): { bg: string; text: string } {
    switch (action) {
        case "review:approve":
        case "restore":
        case "add":
        case "claim":
            return { bg: "bg-[#00A34114]", text: "text-[#00A341]" };
        case "review:reject":
        case "delete":
        case "revoke":
            return { bg: "bg-[#CC292914]", text: "text-[#CC2929]" };
        case "review:suspend":
        case "unclaim":
            return { bg: "bg-[#DC680314]", text: "text-[#DC6803]" };
        case "update":
        case "submit":
        case "resend":
            return { bg: "bg-[#2563EB14]", text: "text-[#2563EB]" };
        default:
            return { bg: "bg-[#0B0E050A]", text: "text-[#0B0E05CC]" };
    }
}

function formatStatusLabel(status: string): string {
    if (!status) {
        return "—";
    }

    return status.replace(/_/g, " ");
}

function Fact({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
    if (!value) {
        return null;
    }

    return (
        <div className="min-w-0 space-y-1">
            <div className="block w-full">
                <Typography type="text12" fontWeight={500} className="!text-[#0B0E05A3]">
                    {label}
                </Typography>
            </div>
            <div className="block w-full">
                <Typography
                    type="text14"
                    fontWeight={600}
                    className={`capitalize break-words ${danger ? "!text-[#CC2929]" : "!text-[#0B0E05]"}`}
                >
                    {value}
                </Typography>
            </div>
        </div>
    );
}

function PersonChip({
    label,
    name,
    email,
    imageUrl,
}: {
    label: string;
    name: string;
    email: string;
    imageUrl?: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <ProfileAvatar name={name} email={email} imageUrl={imageUrl} size="sm" />
            <div className="min-w-0 space-y-0.5">
                <div className="block w-full">
                    <Typography type="text12" fontWeight={500} className="!text-[#0B0E05A3]">
                        {label}
                    </Typography>
                </div>
                <div className="block w-full">
                    <Typography type="text14" fontWeight={700} className="truncate !text-[#0B0E05]">
                        {name}
                    </Typography>
                </div>
            </div>
        </div>
    );
}

function InAppDocumentPreview({
    document,
    onExpand,
}: {
    document: AdminComplianceAuditDocumentPreview;
    onExpand: () => void;
}) {
    const candidates = [
        document.previewUrl,
        document.openUrl,
        ...(document.previewCandidates ?? []),
    ].filter((url, index, list) => Boolean(url) && list.indexOf(url) === index);

    const [candidateIndex, setCandidateIndex] = useState(0);
    const [failed, setFailed] = useState(candidates.length === 0);
    const [loaded, setLoaded] = useState(false);
    const activeUrl = candidates[candidateIndex] ?? "";
    const canShowImage = Boolean(activeUrl) && !failed;

    const handleImageError = () => {
        const nextIndex = candidateIndex + 1;

        if (nextIndex < candidates.length) {
            setCandidateIndex(nextIndex);
            setLoaded(false);
            return;
        }

        setFailed(true);
        setLoaded(true);
    };

    return (
        <div className="overflow-hidden rounded-xl border border-[#0B0E0514] bg-[#0B0E0505]">
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <div className="min-w-0 space-y-0.5">
                    <div className="block w-full">
                        <Typography type="text14" fontWeight={700} className="truncate !text-[#0B0E05]">
                            {document.typeLabel || "Document"}
                        </Typography>
                    </div>
                    <div className="block w-full">
                        <Typography type="text12" fontWeight={400} className="truncate !text-[#0B0E05A3]">
                            {document.filename}
                            {document.format ? ` · ${document.format.toUpperCase()}` : ""}
                            {document.status ? ` · ${formatStatusLabel(document.status)}` : ""}
                        </Typography>
                    </div>
                </div>
                {canShowImage && loaded ? (
                    <button
                        type="button"
                        onClick={onExpand}
                        className="shrink-0 rounded-lg border border-[#0B0E0514] bg-white px-2.5 py-1.5 transition-colors hover:bg-[#0B0E050A]"
                    >
                        <Typography type="text12" fontWeight={600} className="!text-[#0B0E05]">
                            Expand
                        </Typography>
                    </button>
                ) : null}
            </div>

            <div className="relative w-full bg-[#0B0E0508]">
                {canShowImage ? (
                    <button
                        type="button"
                        onClick={loaded ? onExpand : undefined}
                        disabled={!loaded}
                        className="relative block w-full text-left disabled:cursor-default"
                        aria-label={loaded ? `Expand ${document.filename}` : `Loading ${document.filename}`}
                    >
                        {!loaded ? (
                            <div className="flex min-h-[280px] items-center justify-center">
                                <div className="h-8 w-8 animate-pulse rounded-full bg-[#0B0E0514]" />
                            </div>
                        ) : null}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            key={activeUrl}
                            src={activeUrl}
                            alt={document.filename}
                            className={`mx-auto max-h-[420px] w-full object-contain p-3 ${loaded ? "block" : "absolute opacity-0"}`}
                            onLoad={() => setLoaded(true)}
                            onError={handleImageError}
                        />
                    </button>
                ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 py-10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B0E050A]">
                            <FileTextIcon className="h-6 w-6 text-[#0B0E05A3]" />
                        </div>
                        <div className="block w-full text-center">
                            <Typography type="text14" fontWeight={600} className="!text-[#0B0E05]">
                                Preview unavailable
                            </Typography>
                        </div>
                        <div className="block w-full text-center">
                            <Typography type="text12" fontWeight={400} className="!text-[#0B0E05A3]">
                                {document.filename}
                            </Typography>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DocumentLightbox({
    document,
    onClose,
}: {
    document: AdminComplianceAuditDocumentPreview;
    onClose: () => void;
}) {
    return (
        <div className="absolute inset-0 z-20 flex flex-col bg-[#0B0E05F2]">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 space-y-0.5">
                    <div className="block w-full">
                        <Typography type="text14" fontWeight={700} className="truncate !text-white">
                            {document.typeLabel || "Document"}
                        </Typography>
                    </div>
                    <div className="block w-full">
                        <Typography type="text12" fontWeight={400} className="truncate !text-white/70">
                            {document.filename}
                        </Typography>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close document preview"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition-colors hover:bg-white/20"
                >
                    <ModalCloseIcon className="h-4 w-4 text-white" />
                </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={document.previewUrl || document.openUrl}
                    alt={document.filename}
                    className="max-h-full max-w-full object-contain"
                />
            </div>
        </div>
    );
}

export default function ComplianceAuditLogDetailModal({ log }: ComplianceAuditLogDetailModalProps) {
    const { closeModal } = useModal();
    const actionBadge = getActionBadgeClasses(log.action ?? "");
    const documents = log.documents ?? [];
    const [activeDocumentId, setActiveDocumentId] = useState(documents[0]?.id ?? "");
    const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);

    const activeDocument =
        documents.find((document) => document.id === activeDocumentId) ?? documents[0] ?? null;
    const expandedDocument =
        documents.find((document) => document.id === expandedDocumentId) ?? null;

    const assignmentValue =
        log.assignmentBefore && log.assignmentAfter && log.assignmentBefore !== log.assignmentAfter
            ? `${formatStatusLabel(log.assignmentBefore)} → ${formatStatusLabel(log.assignmentAfter)}`
            : formatStatusLabel(log.assignmentAfter || log.assignmentBefore);

    const statusValue =
        log.statusBefore || log.statusAfter
            ? `${formatStatusLabel(log.statusBefore)} → ${formatStatusLabel(log.statusAfter)}`
            : "";

    return (
        <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[16px] bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-[#0B0E0514] px-5 py-4">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-md px-2.5 py-1 ${actionBadge.bg}`}>
                            <Typography type="text12" fontWeight={700} className={actionBadge.text}>
                                {log.actionLabel}
                            </Typography>
                        </span>
                        <Typography type="text12" fontWeight={500} className="!text-[#0B0E05A3]">
                            {log.createdAtExact}
                        </Typography>
                    </div>
                    <div className="block w-full">
                        <Typography type="text16" fontWeight={700} className="!text-[#0B0E05]">
                            {log.eventLabel}
                        </Typography>
                    </div>
                    <div className="block w-full">
                        <Typography type="text14" fontWeight={500} className="!text-[#0B0E05A3]">
                            {log.narrative}
                        </Typography>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close audit details"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#0B0E0514] bg-white transition-colors hover:bg-[#0B0E050A]"
                >
                    <ModalCloseIcon className="h-4 w-4 text-[#0B0E05]" />
                </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
                {activeDocument ? (
                    <section className="space-y-2.5">
                        {documents.length > 1 ? (
                            <div className="flex flex-wrap gap-2">
                                {documents.map((document) => {
                                    const isActive = document.id === activeDocument.id;

                                    return (
                                        <button
                                            key={document.id}
                                            type="button"
                                            onClick={() => setActiveDocumentId(document.id)}
                                            className={`rounded-lg border px-2.5 py-1.5 transition-colors ${
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
                        />
                    </section>
                ) : (
                    <div className="rounded-xl border border-dashed border-[#0B0E0514] px-3.5 py-8 text-center">
                        <Typography type="text14" fontWeight={500} className="!text-[#0B0E05A3]">
                            No document attached to this event
                        </Typography>
                    </div>
                )}

                <section className="grid gap-3 rounded-xl border border-[#0B0E0514] p-3.5 sm:grid-cols-2">
                    <PersonChip
                        label="Performed by"
                        name={log.actorName}
                        email={log.actorEmail}
                        imageUrl={log.actorAvatarUrl}
                    />
                    <PersonChip
                        label="Affected user"
                        name={log.targetUserName}
                        email={log.targetUserEmail}
                        imageUrl={log.targetUserAvatarUrl}
                    />
                </section>

                <section className="grid grid-cols-2 gap-x-5 gap-y-4 rounded-xl border border-[#0B0E0514] p-3.5 sm:grid-cols-3">
                    <Fact label="Record" value={log.subjectLabel} />
                    <Fact label="Status" value={statusValue} />
                    <Fact label="Assignment" value={assignmentValue} />
                    <Fact label="Assignee" value={log.assigneeName} />
                    <Fact label="Reviewed" value={log.reviewedAtLabel} />
                    <Fact label="Reason" value={log.rejectionReason} danger />
                </section>
            </div>

            {expandedDocument ? (
                <DocumentLightbox
                    document={expandedDocument}
                    onClose={() => setExpandedDocumentId(null)}
                />
            ) : null}
        </div>
    );
}
