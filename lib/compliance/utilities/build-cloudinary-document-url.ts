const DEFAULT_CLOUDINARY_CLOUD_NAME = "extelvogroup";

/** Returns the Cloudinary cloud name used for compliance document delivery. */
export function getCloudinaryCloudName(): string {
    return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || DEFAULT_CLOUDINARY_CLOUD_NAME;
}

/**
 * Builds a Cloudinary delivery URL from a compliance document fileId / public id.
 * Passes through absolute URLs unchanged.
 * Compliance uploads use Cloudinary image resource type.
 */
export function buildCloudinaryDocumentUrl(
    fileId?: string | null,
    format?: string | null,
    options?: { pagePreview?: boolean },
): string {
    const trimmedFileId = fileId?.trim();

    if (!trimmedFileId) {
        return "";
    }

    if (/^https?:\/\//i.test(trimmedFileId)) {
        return trimmedFileId;
    }

    const cloudName = getCloudinaryCloudName();
    const normalizedFormat = format?.trim().toLowerCase();
    const transforms = options?.pagePreview && normalizedFormat === "pdf" ? "f_jpg,pg_1,q_auto/" : "";

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}${trimmedFileId}`;
};

/** Returns true when a document format can be rendered as an image preview. */
export function isImageDocumentFormat(format?: string | null): boolean {
    const normalizedFormat = format?.trim().toLowerCase();
    return (
        normalizedFormat === "png" ||
        normalizedFormat === "jpg" ||
        normalizedFormat === "jpeg" ||
        normalizedFormat === "webp" ||
        normalizedFormat === "gif" ||
        normalizedFormat === "pdf"
    );
}

/**
 * Same-origin preview path that streams the document through the admin app.
 * Keeps Cloudinary access signing on the server.
 */
export function buildComplianceDocumentPreviewPath(
    fileId?: string | null,
    format?: string | null,
): string {
    const trimmedFileId = fileId?.trim();

    if (!trimmedFileId) {
        return "";
    }

    if (/^https?:\/\//i.test(trimmedFileId)) {
        return trimmedFileId;
    }

    const params = new URLSearchParams({ fileId: trimmedFileId });
    const normalizedFormat = format?.trim();

    if (normalizedFormat) {
        params.set("format", normalizedFormat);
    }

    return `/api/compliance/document-preview?${params.toString()}`;
}

/**
 * Builds candidate delivery URLs for a compliance document public id.
 * Order: direct Cloudinary variants first, then same-origin proxy.
 */
export function buildComplianceDocumentPreviewCandidates(
    fileId?: string | null,
    format?: string | null,
): string[] {
    const trimmedFileId = fileId?.trim();

    if (!trimmedFileId) {
        return [];
    }

    if (/^https?:\/\//i.test(trimmedFileId)) {
        return [trimmedFileId];
    }

    const cloudName = getCloudinaryCloudName();
    const normalizedFormat = format?.trim().toLowerCase() ?? "";
    const withFormat = normalizedFormat ? `${trimmedFileId}.${normalizedFormat}` : "";
    const candidates = [
        `https://res.cloudinary.com/${cloudName}/image/upload/${trimmedFileId}`,
        withFormat ? `https://res.cloudinary.com/${cloudName}/image/upload/${withFormat}` : "",
        `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${trimmedFileId}`,
        `https://res.cloudinary.com/${cloudName}/image/authenticated/${trimmedFileId}`,
        `https://res.cloudinary.com/${cloudName}/image/private/${trimmedFileId}`,
        buildComplianceDocumentPreviewPath(trimmedFileId, format),
    ];

    return [...new Set(candidates.filter(Boolean))];
}
