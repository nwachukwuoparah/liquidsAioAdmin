import type {
    AdminComplianceAuditActorType,
    AdminComplianceAuditChangeData,
    AdminComplianceAuditDetailItem,
    AdminComplianceAuditDocumentPreview,
    AdminComplianceAuditDocumentSnapshot,
    AdminComplianceAuditLogApiRecord,
    AdminComplianceAuditLogRecord,
    AdminComplianceAuditPartyApiRecord,
} from "@/lib/compliance/types/admin-compliance-audit.types";
import {
    buildCloudinaryDocumentUrl,
    buildComplianceDocumentPreviewCandidates,
    buildComplianceDocumentPreviewPath,
    isImageDocumentFormat,
} from "@/lib/compliance/utilities/build-cloudinary-document-url";
import { getProfileDisplayName } from "@/lib/profile-avatar";

function resolvePartyName(party?: AdminComplianceAuditPartyApiRecord | null): string {
    if (!party) {
        return "";
    }

    const name = getProfileDisplayName(party.firstName, party.lastName, party.email);
    return name === "User" && !party.email ? "" : name;
}

function resolvePartyEmail(party?: AdminComplianceAuditPartyApiRecord | null): string {
    return party?.email?.trim() ?? "";
}

function resolvePartyAvatar(party?: AdminComplianceAuditPartyApiRecord | null): string | undefined {
    return party?.profilePicture ?? undefined;
}

function resolveActorType(record: AdminComplianceAuditLogApiRecord): AdminComplianceAuditActorType {
    const rawType = (record.actorType ?? "").trim().toLowerCase();

    if (rawType === "admin" || Boolean(record.actorAdminId ?? record.actorAdmin)) {
        return "admin";
    }

    if (rawType === "user" || Boolean(record.actorUserId ?? record.actorUser)) {
        return "user";
    }

    return "unknown";
}

function formatActionLabel(action: string): string {
    switch (action) {
        case "review:approve":
            return "Approved";
        case "review:reject":
            return "Rejected";
        case "review:suspend":
            return "Suspended";
        case "submit":
            return "Submitted";
        case "update":
            return "Updated";
        case "delete":
            return "Deleted";
        case "add":
            return "Added";
        case "claim":
            return "Claimed";
        case "unclaim":
            return "Unclaimed";
        case "resend":
            return "Resent";
        case "revoke":
            return "Revoked";
        case "restore":
            return "Restored";
        default:
            if (!action) {
                return "Unknown";
            }

            return action
                .split(/[:_]/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
    }
}

function formatSubjectLabel(subject: string): string {
    switch (subject) {
        case "kyc":
            return "KYC";
        case "kyb":
            return "KYB";
        case "kyc_document":
            return "KYC document";
        case "kyb_document":
            return "KYB document";
        case "assignment":
            return "Assignment";
        default:
            if (!subject) {
                return "Record";
            }

            return subject
                .split("_")
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
    }
}

function formatRelativeOrCalendarDate(isoDate?: string | null): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    const elapsedMinutes = Math.floor((Date.now() - parsedDate.getTime()) / 60000);

    if (elapsedMinutes < 1) {
        return "Just now";
    }

    if (elapsedMinutes < 60) {
        return `${elapsedMinutes}m ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);

    if (elapsedHours < 24) {
        return elapsedHours === 1 ? "1h ago" : `${elapsedHours}h ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedDays === 1) {
        return "Yesterday";
    }

    if (elapsedDays < 7) {
        return `${elapsedDays}d ago`;
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatExactTimestamp(isoDate?: string | null): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    return parsedDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function resolveEntityStatus(changeData?: AdminComplianceAuditChangeData | null): string {
    if (!changeData) {
        return "";
    }

    return (
        changeData.kyc?.status ??
        changeData.kyb?.status ??
        changeData.document?.status ??
        changeData.documents?.[0]?.status ??
        changeData.assignment?.status ??
        changeData.complianceState?.complianceReviewStatus ??
        ""
    ).trim();
}

function resolveRejectionReason(
    afterData?: AdminComplianceAuditChangeData | null,
    document?: AdminComplianceAuditLogApiRecord["document"],
): string {
    return (
        afterData?.kyc?.rejectionReason ??
        afterData?.kyb?.rejectionReason ??
        afterData?.document?.rejectionReason ??
        afterData?.documents?.find((item) => item.rejectionReason)?.rejectionReason ??
        document?.rejectionReason ??
        ""
    ).trim();
}

function resolveDocumentType(
    record: AdminComplianceAuditLogApiRecord,
    afterData?: AdminComplianceAuditChangeData | null,
    beforeData?: AdminComplianceAuditChangeData | null,
): string {
    return (
        record.document?.type ??
        afterData?.document?.type ??
        beforeData?.document?.type ??
        afterData?.documents?.[0]?.type ??
        beforeData?.documents?.[0]?.type ??
        ""
    ).trim();
}

function resolveDocumentFilename(
    record: AdminComplianceAuditLogApiRecord,
    afterData?: AdminComplianceAuditChangeData | null,
    beforeData?: AdminComplianceAuditChangeData | null,
): string {
    const candidates = [
        record.document?.originalFilename,
        record.document?.originalFileName,
        afterData?.document?.originalFilename,
        afterData?.document?.originalFileName,
        beforeData?.document?.originalFilename,
        beforeData?.document?.originalFileName,
        afterData?.documents?.[0]?.originalFilename,
        afterData?.documents?.[0]?.originalFileName,
        beforeData?.documents?.[0]?.originalFilename,
        beforeData?.documents?.[0]?.originalFileName,
    ];

    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    }

    return "";
}

function formatDocumentTypeLabel(documentType: string): string {
    if (!documentType) {
        return "";
    }

    return documentType
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function resolveAssignmentStatus(changeData?: AdminComplianceAuditChangeData | null): string {
    return (changeData?.assignment?.status ?? "").trim();
}

function resolveAssigneeName(changeData?: AdminComplianceAuditChangeData | null): string {
    return resolvePartyName(changeData?.assignment?.assignedAdmin ?? null);
}

function resolveReviewedAt(changeData?: AdminComplianceAuditChangeData | null): string {
    return (
        changeData?.kyc?.reviewedAt ??
        changeData?.kyb?.reviewedAt ??
        changeData?.complianceState?.complianceUpdatedAt ??
        ""
    ).trim();
}

function resolveDocumentCount(changeData?: AdminComplianceAuditChangeData | null): number {
    if (!changeData) {
        return 0;
    }

    if (Array.isArray(changeData.documents)) {
        return changeData.documents.length;
    }

    if (Array.isArray(changeData.kyc?.kycDocuments)) {
        return changeData.kyc.kycDocuments.length;
    }

    if (Array.isArray(changeData.kyb?.kybDocuments)) {
        return changeData.kyb.kybDocuments.length;
    }

    return changeData.document ? 1 : 0;
}

function pushDocumentSnapshot(
    documents: AdminComplianceAuditDocumentSnapshot[],
    seen: Set<string>,
    document?: AdminComplianceAuditDocumentSnapshot | null,
): void {
    if (!document) {
        return;
    }

    const key =
        document.id?.trim() ||
        document.fileId?.trim() ||
        document.fileUrl?.trim() ||
        `${document.type ?? ""}:${document.originalFilename ?? document.originalFileName ?? ""}`;

    if (!key || seen.has(key)) {
        return;
    }

    seen.add(key);
    documents.push(document);
}

function collectDocumentSnapshots(
    record: AdminComplianceAuditLogApiRecord,
    afterData?: AdminComplianceAuditChangeData | null,
    beforeData?: AdminComplianceAuditChangeData | null,
): AdminComplianceAuditDocumentSnapshot[] {
    const documents: AdminComplianceAuditDocumentSnapshot[] = [];
    const seen = new Set<string>();

    pushDocumentSnapshot(documents, seen, record.document);
    pushDocumentSnapshot(documents, seen, afterData?.document);
    pushDocumentSnapshot(documents, seen, beforeData?.document);

    for (const document of afterData?.documents ?? []) {
        pushDocumentSnapshot(documents, seen, document);
    }

    for (const document of beforeData?.documents ?? []) {
        pushDocumentSnapshot(documents, seen, document);
    }

    for (const document of afterData?.kyc?.kycDocuments ?? []) {
        pushDocumentSnapshot(documents, seen, document);
    }

    for (const document of beforeData?.kyc?.kycDocuments ?? []) {
        pushDocumentSnapshot(documents, seen, document);
    }

    for (const document of afterData?.kyb?.kybDocuments ?? []) {
        pushDocumentSnapshot(documents, seen, document);
    }

    for (const document of beforeData?.kyb?.kybDocuments ?? []) {
        pushDocumentSnapshot(documents, seen, document);
    }

    return documents;
}

function mapDocumentPreview(
    document: AdminComplianceAuditDocumentSnapshot,
    index: number,
): AdminComplianceAuditDocumentPreview | null {
    const absoluteUrlCandidates = [
        document.fileUrl?.trim(),
        document.url?.trim(),
        document.filePath?.trim(),
    ].filter((value): value is string => Boolean(value && /^https?:\/\//i.test(value)));

    const publicId =
        document.fileId?.trim() ||
        [document.fileUrl, document.url, document.filePath]
            .map((value) => value?.trim())
            .find((value) => Boolean(value) && !/^https?:\/\//i.test(value ?? "")) ||
        "";

    const format = (document.format ?? "").trim();
    const previewCandidates = [
        ...absoluteUrlCandidates,
        ...buildComplianceDocumentPreviewCandidates(publicId, format),
    ].filter(Boolean);
    const uniqueCandidates = [...new Set(previewCandidates)];

    // Prefer the direct Cloudinary delivery URL for <img src={previewUrl}>.
    const previewUrl =
        absoluteUrlCandidates[0] ||
        buildCloudinaryDocumentUrl(publicId, format) ||
        buildComplianceDocumentPreviewPath(publicId, format) ||
        uniqueCandidates[0] ||
        "";

    if (!previewUrl) {
        return null;
    }

    const filename =
        document.originalFilename?.trim() ||
        document.originalFileName?.trim() ||
        "Document";

    return {
        id: document.id?.trim() || publicId || absoluteUrlCandidates[0] || `document-${index}`,
        typeLabel: formatDocumentTypeLabel((document.type ?? "").trim()),
        filename,
        format,
        status: (document.status ?? "").trim(),
        previewUrl,
        openUrl: uniqueCandidates.find((url) => url !== previewUrl) || previewUrl,
        previewCandidates: uniqueCandidates.length > 0 ? uniqueCandidates : [previewUrl],
        isImage: isImageDocumentFormat(format) || Boolean(previewUrl),
    };
}

function buildDetailItems({
    subjectLabel,
    subjectId,
    documentTypeLabel,
    documentFilename,
    rejectionReason,
    assignmentBefore,
    assignmentAfter,
    assigneeName,
    reviewedAt,
    documentCount,
    metadataPath,
    metadataMethod,
}: {
    subjectLabel: string;
    subjectId: string;
    documentTypeLabel: string;
    documentFilename: string;
    rejectionReason: string;
    assignmentBefore: string;
    assignmentAfter: string;
    assigneeName: string;
    reviewedAt: string;
    documentCount: number;
    metadataPath: string;
    metadataMethod: string;
}): AdminComplianceAuditDetailItem[] {
    const items: AdminComplianceAuditDetailItem[] = [];

    if (documentTypeLabel || documentFilename) {
        items.push({
            label: "Document",
            value: [documentTypeLabel, documentFilename].filter(Boolean).join(" · "),
        });
    }

    if (rejectionReason) {
        items.push({
            label: "Reason",
            value: rejectionReason,
            tone: "danger",
        });
    }

    if (assignmentBefore || assignmentAfter) {
        const assignmentValue =
            assignmentBefore && assignmentAfter && assignmentBefore !== assignmentAfter
                ? `${assignmentBefore} → ${assignmentAfter}`
                : assignmentAfter || assignmentBefore;

        items.push({
            label: "Assignment",
            value: assigneeName ? `${assignmentValue} · ${assigneeName}` : assignmentValue,
        });
    }

    if (documentCount > 0 && !documentFilename) {
        items.push({
            label: "Files",
            value: `${documentCount} document${documentCount === 1 ? "" : "s"}`,
        });
    }

    if (reviewedAt) {
        items.push({
            label: "Reviewed",
            value: formatExactTimestamp(reviewedAt),
        });
    }

    if (subjectId) {
        items.push({
            label: subjectLabel || "Record",
            value: subjectId.length > 16 ? `${subjectId.slice(0, 8)}…${subjectId.slice(-4)}` : subjectId,
        });
    }

    if (metadataMethod || metadataPath) {
        items.push({
            label: "Request",
            value: [metadataMethod, metadataPath].filter(Boolean).join(" "),
        });
    }

    return items;
}

/**
 * Enriches a raw audit-log API record with display helpers.
 * Spreads the full network payload so nothing from the response is dropped.
 */
export function mapAdminComplianceAuditLogRecord(
    record: AdminComplianceAuditLogApiRecord,
    index: number,
): AdminComplianceAuditLogRecord {
    const action = (record.action ?? "").trim().toLowerCase();
    const subject = (record.subjectType ?? "").trim().toLowerCase();
    const actorType = resolveActorType(record);
    const actorParty = record.actorAdmin ?? record.actorUser;
    const targetParty = record.targetUser;
    const beforeData = record.beforeData;
    const afterData = record.afterData;
    const actionLabel = formatActionLabel(action);
    const subjectLabel = formatSubjectLabel(subject);
    const actorName =
        resolvePartyName(actorParty) ||
        (actorType === "admin" ? "Admin" : actorType === "user" ? "User" : "System");
    const actorEmail = resolvePartyEmail(actorParty);
    const targetUserName = resolvePartyName(targetParty) || "—";
    const targetUserEmail = resolvePartyEmail(targetParty);
    const statusBefore = resolveEntityStatus(beforeData);
    const statusAfter = resolveEntityStatus(afterData);
    const rejectionReason = resolveRejectionReason(afterData, record.document);
    const documentType = resolveDocumentType(record, afterData, beforeData);
    const documentFilename = resolveDocumentFilename(record, afterData, beforeData);
    const documentTypeLabel = formatDocumentTypeLabel(documentType);
    const assignmentBefore = resolveAssignmentStatus(beforeData);
    const assignmentAfter = resolveAssignmentStatus(afterData);
    const assigneeName = resolveAssigneeName(afterData) || resolveAssigneeName(beforeData);
    const reviewedAt = resolveReviewedAt(afterData) || resolveReviewedAt(beforeData);
    const documents = collectDocumentSnapshots(record, afterData, beforeData)
        .map((document, documentIndex) => mapDocumentPreview(document, documentIndex))
        .filter((document): document is AdminComplianceAuditDocumentPreview => Boolean(document));
    const documentCount = Math.max(
        documents.length,
        resolveDocumentCount(afterData),
        resolveDocumentCount(beforeData),
    );
    const detailItems = buildDetailItems({
        subjectLabel,
        subjectId: (record.subjectId ?? "").trim(),
        documentTypeLabel,
        documentFilename,
        rejectionReason,
        assignmentBefore,
        assignmentAfter,
        assigneeName,
        reviewedAt,
        documentCount,
        metadataPath: (record.metadata?.path ?? "").trim(),
        metadataMethod: (record.metadata?.method ?? "").trim(),
    });
    const eventLabel = documentTypeLabel
        ? `${actionLabel} ${documentTypeLabel}`
        : `${actionLabel} ${subjectLabel}`;
    const summary = `${eventLabel} by ${actorName}${
        targetUserName !== "—" ? ` · ${targetUserName}` : ""
    }`;
    const narrative = buildAuditNarrative({
        actorName,
        actionLabel,
        subjectLabel,
        documentTypeLabel,
        targetUserName,
        statusBefore,
        statusAfter,
    });

    return {
        ...record,
        sn: `${index + 1}.`,
        createdAtLabel: formatRelativeOrCalendarDate(record.createdAt),
        createdAtExact: formatExactTimestamp(record.createdAt),
        actionLabel,
        subject,
        subjectLabel,
        actorTypeLabel: actorType === "admin" ? "Admin" : actorType === "user" ? "User" : "System",
        actorName,
        actorEmail,
        actorAvatarUrl: resolvePartyAvatar(actorParty),
        targetUserName,
        targetUserEmail,
        targetUserAvatarUrl: resolvePartyAvatar(targetParty),
        statusBefore,
        statusAfter,
        rejectionReason,
        documentType,
        documentFilename,
        documentTypeLabel,
        documentCount,
        documents,
        assignmentBefore,
        assignmentAfter,
        assigneeName,
        reviewedAtLabel: reviewedAt ? formatExactTimestamp(reviewedAt) : "",
        detailItems,
        eventLabel,
        summary,
        narrative,
    };
}

function buildAuditNarrative({
    actorName,
    actionLabel,
    subjectLabel,
    documentTypeLabel,
    targetUserName,
    statusBefore,
    statusAfter,
}: {
    actorName: string;
    actionLabel: string;
    subjectLabel: string;
    documentTypeLabel: string;
    targetUserName: string;
    statusBefore: string;
    statusAfter: string;
}): string {
    const subjectPart = documentTypeLabel || subjectLabel;
    const targetPart =
        targetUserName && targetUserName !== "—" ? `${targetUserName}'s` : "a";
    const actionVerb = actionLabel.toLowerCase();
    const changePart =
        statusBefore && statusAfter && statusBefore !== statusAfter
            ? `, changing status from ${statusBefore.replace(/_/g, " ")} to ${statusAfter.replace(/_/g, " ")}`
            : "";

    return `${actorName} ${actionVerb} ${targetPart} ${subjectPart}${changePart}.`;
}
