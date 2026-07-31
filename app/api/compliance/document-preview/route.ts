import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth/constants/auth-api.constant";
import { getAdminApiBaseUrl } from "@/lib/admin/services/admin-api-client";
import { buildCloudinaryDocumentUrl } from "@/lib/compliance/utilities/build-cloudinary-document-url";
import { buildSignedCloudinaryDocumentUrlCandidates } from "@/lib/compliance/utilities/sign-cloudinary-document-url";

export const runtime = "nodejs";

function getAccessTokenFromRequest(request: NextRequest): string | null {
    return request.cookies.get(ACCESS_TOKEN_STORAGE_KEY)?.value?.trim() || null;
}

async function tryFetchImage(url: string): Promise<Response | null> {
    try {
        const response = await fetch(url, {
            headers: {
                Accept: "image/*,application/pdf,*/*",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (
            contentType &&
            !contentType.startsWith("image/") &&
            contentType !== "application/pdf" &&
            !contentType.includes("octet-stream")
        ) {
            return null;
        }

        return response;
    } catch {
        return null;
    }
}

async function tryBackendSignedUrl(
    accessToken: string,
    fileId: string,
    format: string,
): Promise<string> {
    const apiBase = getAdminApiBaseUrl();
    if (!apiBase) {
        return "";
    }

    const query = new URLSearchParams({
        publicId: fileId,
        public_id: fileId,
        fileId,
        format,
    });

    const candidatePaths = [
        `/compliance/signed-url?${query.toString()}`,
        `/compliance/signed-download?${query.toString()}`,
        `/compliance/documents/signed-url?${query.toString()}`,
        `/media/signed-url?${query.toString()}`,
    ];

    for (const path of candidatePaths) {
        try {
            const response = await fetch(`${apiBase}${path}`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: "no-store",
            });

            if (!response.ok) {
                continue;
            }

            const body = (await response.json()) as {
                data?: { url?: string; secure_url?: string; signedUrl?: string };
                url?: string;
                secure_url?: string;
                signedUrl?: string;
            };

            const url =
                body.data?.url ||
                body.data?.secure_url ||
                body.data?.signedUrl ||
                body.url ||
                body.secure_url ||
                body.signedUrl ||
                "";

            if (typeof url === "string" && /^https?:\/\//i.test(url)) {
                return url;
            }
        } catch {
            // try next candidate
        }
    }

    return "";
}

/**
 * Proxies a compliance document image for in-app preview.
 * Uses backend signed URL when available, otherwise Cloudinary signed delivery.
 */
export async function GET(request: NextRequest) {
    const accessToken = getAccessTokenFromRequest(request);

    if (!accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const fileId = request.nextUrl.searchParams.get("fileId")?.trim() ?? "";
    const format = request.nextUrl.searchParams.get("format")?.trim() ?? "";

    if (!fileId) {
        return NextResponse.json({ message: "fileId is required" }, { status: 400 });
    }

    if (/^https?:\/\//i.test(fileId)) {
        const direct = await tryFetchImage(fileId);
        if (direct) {
            return new NextResponse(direct.body, {
                status: 200,
                headers: {
                    "Content-Type": direct.headers.get("content-type") || "image/png",
                    "Cache-Control": "private, max-age=300",
                },
            });
        }
    }

    const urlsToTry: string[] = [];

    const backendUrl = await tryBackendSignedUrl(accessToken, fileId, format);
    if (backendUrl) {
        urlsToTry.push(backendUrl);
    }

    urlsToTry.push(...buildSignedCloudinaryDocumentUrlCandidates(fileId, format));

    const unsigned = buildCloudinaryDocumentUrl(fileId, format, {
        pagePreview: format.toLowerCase() === "pdf",
    });
    if (unsigned) {
        urlsToTry.push(unsigned);
        if (format) {
            urlsToTry.push(`${unsigned}.${format.replace(/^\./, "")}`);
        }
    }

    for (const url of [...new Set(urlsToTry)]) {
        const imageResponse = await tryFetchImage(url);
        if (!imageResponse) {
            continue;
        }

        return new NextResponse(imageResponse.body, {
            status: 200,
            headers: {
                "Content-Type": imageResponse.headers.get("content-type") || "image/png",
                "Cache-Control": "private, max-age=300",
            },
        });
    }

    return NextResponse.json(
        { message: "Document preview unavailable" },
        { status: 404 },
    );
}
