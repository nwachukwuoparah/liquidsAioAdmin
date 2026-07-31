import {
    buildCloudinaryDocumentUrl,
    buildComplianceDocumentPreviewCandidates,
    buildComplianceDocumentPreviewPath,
    isImageDocumentFormat,
} from "@/lib/compliance/utilities/build-cloudinary-document-url";

describe("buildCloudinaryDocumentUrl", () => {
    it("passes through absolute URLs", () => {
        expect(buildCloudinaryDocumentUrl("https://cdn.example.com/file.png")).toBe(
            "https://cdn.example.com/file.png",
        );
    });

    it("builds an image delivery URL from a Cloudinary public id", () => {
        expect(buildCloudinaryDocumentUrl("compliance/uePU4MjtZZQX/resale-certificate-FqhMSQ", "png")).toBe(
            "https://res.cloudinary.com/extelvogroup/image/upload/compliance/uePU4MjtZZQX/resale-certificate-FqhMSQ",
        );
    });

    it("builds a page preview URL for PDFs", () => {
        expect(
            buildCloudinaryDocumentUrl("compliance/uePU4MjtZZQX/gov-id", "pdf", { pagePreview: true }),
        ).toBe(
            "https://res.cloudinary.com/extelvogroup/image/upload/f_jpg,pg_1,q_auto/compliance/uePU4MjtZZQX/gov-id",
        );
    });

    it("returns an empty string when fileId is missing", () => {
        expect(buildCloudinaryDocumentUrl(null)).toBe("");
        expect(buildCloudinaryDocumentUrl("   ")).toBe("");
    });
});

describe("buildComplianceDocumentPreviewPath", () => {
    it("builds a same-origin preview path for public ids", () => {
        expect(buildComplianceDocumentPreviewPath("compliance/uePU4MjtZZQX/gov-id-5uPtKQ", "png")).toBe(
            "/api/compliance/document-preview?fileId=compliance%2FuePU4MjtZZQX%2Fgov-id-5uPtKQ&format=png",
        );
    });

    it("passes through absolute URLs", () => {
        expect(buildComplianceDocumentPreviewPath("https://cdn.example.com/file.png")).toBe(
            "https://cdn.example.com/file.png",
        );
    });
});

describe("buildComplianceDocumentPreviewCandidates", () => {
    it("includes direct Cloudinary URLs and the proxy path", () => {
        const candidates = buildComplianceDocumentPreviewCandidates(
            "compliance/uePU4MjtZZQX/gov-id-5uPtKQ",
            "png",
        );

        expect(candidates[0]).toBe(
            "https://res.cloudinary.com/extelvogroup/image/upload/compliance/uePU4MjtZZQX/gov-id-5uPtKQ",
        );
        expect(candidates).toContain(
            "https://res.cloudinary.com/extelvogroup/image/upload/compliance/uePU4MjtZZQX/gov-id-5uPtKQ.png",
        );
        expect(candidates.at(-1)).toContain("/api/compliance/document-preview?");
    });
});

describe("isImageDocumentFormat", () => {
    it("recognizes common image and pdf formats", () => {
        expect(isImageDocumentFormat("png")).toBe(true);
        expect(isImageDocumentFormat("PDF")).toBe(true);
        expect(isImageDocumentFormat("docx")).toBe(false);
    });
});
