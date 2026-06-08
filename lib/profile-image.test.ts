import { afterEach, describe, expect, it, vi } from "vitest";
import {
    deleteProfileImage,
    getProfileImageEndpoint,
    uploadProfileImage,
    validateProfileImageFile,
} from "./profile-image";

describe("validateProfileImageFile", () => {
    it("accepts supported image types within size limit", () => {
        const file = new File(["x"], "avatar.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 1024 });

        expect(validateProfileImageFile(file)).toBeNull();
    });

    it("rejects unsupported file types", () => {
        const file = new File(["x"], "avatar.pdf", { type: "application/pdf" });
        Object.defineProperty(file, "size", { value: 1024 });

        expect(validateProfileImageFile(file)).toBe("Please select a JPG, PNG, WEBP, or GIF image.");
    });

    it("rejects files larger than 5 MB", () => {
        const file = new File(["x"], "avatar.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 + 1 });

        expect(validateProfileImageFile(file)).toBe("Image must be 5 MB or smaller.");
    });
});

describe("profile image API", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("uploads image via multipart form data", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ imageUrl: "https://cdn.example.com/avatar.png" }),
        });

        const file = new File(["image"], "avatar.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 1024 });

        const result = await uploadProfileImage(file, fetchMock);

        expect(result).toEqual({ imageUrl: "https://cdn.example.com/avatar.png" });
        expect(fetchMock).toHaveBeenCalledWith(getProfileImageEndpoint(), {
            method: "POST",
            body: expect.any(FormData),
        });
        expect((fetchMock.mock.calls[0][1].body as FormData).get("image")).toBe(file);
    });

    it("throws when upload response is not ok", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: false });
        const file = new File(["image"], "avatar.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 1024 });

        await expect(uploadProfileImage(file, fetchMock)).rejects.toThrow("Failed to upload profile image.");
    });

    it("deletes profile image", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });

        await deleteProfileImage(fetchMock);

        expect(fetchMock).toHaveBeenCalledWith(getProfileImageEndpoint(), { method: "DELETE" });
    });
});
