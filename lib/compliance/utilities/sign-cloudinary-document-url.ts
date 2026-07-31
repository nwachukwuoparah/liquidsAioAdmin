import { createHash } from "node:crypto";
import { getCloudinaryCloudName } from "@/lib/compliance/utilities/build-cloudinary-document-url";

type CloudinaryDeliveryType = "upload" | "authenticated" | "private";

function toUrlSafeSignature(sha1Base64: string): string {
    return sha1Base64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, 8);
}

/**
 * Builds a signed Cloudinary delivery URL for a compliance document public id.
 * Requires CLOUDINARY_API_SECRET (and optionally CLOUDINARY_API_KEY).
 */
export function buildSignedCloudinaryDocumentUrl(
    fileId: string,
    options?: {
        format?: string | null;
        deliveryType?: CloudinaryDeliveryType;
        transformation?: string;
    },
): string {
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const trimmedFileId = fileId.trim();

    if (!apiSecret || !trimmedFileId) {
        return "";
    }

    const cloudName = getCloudinaryCloudName();
    const deliveryType = options?.deliveryType ?? "authenticated";
    const transformation = options?.transformation?.replace(/^\/+|\/+$/g, "") ?? "";
    const stringToSign = transformation ? `${transformation}/${trimmedFileId}` : trimmedFileId;
    const signature = toUrlSafeSignature(createHash("sha1").update(stringToSign + apiSecret).digest("base64"));
    const transformationSegment = transformation ? `${transformation}/` : "";

    return `https://res.cloudinary.com/${cloudName}/image/${deliveryType}/s--${signature}--/${transformationSegment}${trimmedFileId}`;
}

/** Candidate signed delivery URLs to try for a protected compliance document. */
export function buildSignedCloudinaryDocumentUrlCandidates(
    fileId: string,
    format?: string | null,
): string[] {
    const normalizedFormat = format?.trim().toLowerCase();
    const pagePreviewTransform = normalizedFormat === "pdf" ? "f_jpg,pg_1,q_auto" : "";
    const candidates: string[] = [];

    for (const deliveryType of ["authenticated", "private", "upload"] as const) {
        const signed = buildSignedCloudinaryDocumentUrl(fileId, {
            format,
            deliveryType,
            transformation: pagePreviewTransform || undefined,
        });

        if (signed) {
            candidates.push(signed);
        }

        if (!pagePreviewTransform) {
            continue;
        }

        const withoutPreview = buildSignedCloudinaryDocumentUrl(fileId, {
            format,
            deliveryType,
        });

        if (withoutPreview) {
            candidates.push(withoutPreview);
        }
    }

    return [...new Set(candidates)];
}
