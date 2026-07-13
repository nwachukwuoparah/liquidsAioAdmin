import { afterEach, describe, expect, it, vi } from "vitest";
import {
    deleteProfileImage,
    fetchProfilePictureSignedUpload,
    saveProfilePicture,
    uploadFileToCloudinary,
    uploadProfileImage,
    validateProfileImageFile,
} from "./profile-image";

const { getMock, postMock, deleteMock, axiosPostMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
    postMock: vi.fn(),
    deleteMock: vi.fn(),
    axiosPostMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: getMock,
        post: postMock,
        delete: deleteMock,
    },
}));

vi.mock("axios", () => ({
    default: {
        post: axiosPostMock,
    },
}));

const signedUpload = {
    payload: {
        timestamp: 1700000000,
        folder: "profiles/user123",
        overwrite: true,
        invalidate: true,
        public_id: "profile-picture",
    },
    signature: "abcdef1234567890",
    cloudname: "your-cloud-name",
    apiKey: "your-api-key",
    expiresIn: "2026-01-01T00:00:00.000Z",
};

describe("validateProfileImageFile", () => {
    it("accepts supported image types within size limit", () => {
        const file = new File(["x"], "avatar.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 1024 });

        expect(validateProfileImageFile(file)).toBeNull();
    });

    it("rejects unsupported file types", () => {
        const file = new File(["x"], "avatar.webp", { type: "image/webp" });
        Object.defineProperty(file, "size", { value: 1024 });

        expect(validateProfileImageFile(file)).toBe("Please select a JPG or PNG image.");
    });

    it("rejects files larger than 5 MB", () => {
        const file = new File(["x"], "avatar.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 + 1 });

        expect(validateProfileImageFile(file)).toBe("Image must be 5 MB or smaller.");
    });
});

describe("profile image upload flow", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("fetches signed upload credentials from GET /profile/picture/signed-upload", async () => {
        getMock.mockResolvedValue({
            body: { status: "success", data: signedUpload },
        });

        await expect(fetchProfilePictureSignedUpload()).resolves.toEqual(signedUpload);
        expect(getMock).toHaveBeenCalledWith("/profile/picture/signed-upload");
    });

    it("uploads the file to Cloudinary and reports progress", async () => {
        const progressValues: number[] = [];
        axiosPostMock.mockImplementation(async (_url, _body, config) => {
            config?.onUploadProgress?.({ loaded: 50, total: 100 });
            config?.onUploadProgress?.({ loaded: 100, total: 100 });
            return {
                data: {
                    secure_url:
                        "https://res.cloudinary.com/your-cloud-name/image/upload/v1/profiles/user123/profile-picture.jpg",
                },
            };
        });

        const file = new File(["image"], "avatar.jpg", { type: "image/jpeg" });
        Object.defineProperty(file, "size", { value: 1024 });

        const imageUrl = await uploadFileToCloudinary(file, signedUpload, (percent) => {
            progressValues.push(percent);
        });

        expect(imageUrl).toContain("cloudinary.com");
        expect(axiosPostMock).toHaveBeenCalledWith(
            "https://api.cloudinary.com/v1_1/your-cloud-name/image/upload",
            expect.any(FormData),
            expect.objectContaining({ onUploadProgress: expect.any(Function) }),
        );
        expect(progressValues).toEqual([45, 90]);
    });

    it("saves the Cloudinary URL via POST /profile/picture", async () => {
        postMock.mockResolvedValue({ body: { status: "success", data: {} } });

        await saveProfilePicture("https://res.cloudinary.com/example/profile.jpg");

        expect(postMock).toHaveBeenCalledWith("/profile/picture", {
            profilePicture: "https://res.cloudinary.com/example/profile.jpg",
        });
    });

    it("runs signed upload → Cloudinary → save and reports end-to-end progress", async () => {
        const progressValues: number[] = [];
        getMock.mockResolvedValue({
            body: { status: "success", data: signedUpload },
        });
        axiosPostMock.mockResolvedValue({
            data: {
                secure_url: "https://res.cloudinary.com/your-cloud-name/image/upload/v1/avatar.jpg",
            },
        });
        postMock.mockResolvedValue({ body: { status: "success", data: {} } });

        const file = new File(["image"], "avatar.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 1024 });

        const result = await uploadProfileImage(file, {
            onProgress: (percent) => progressValues.push(percent),
        });

        expect(result).toEqual({
            imageUrl: "https://res.cloudinary.com/your-cloud-name/image/upload/v1/avatar.jpg",
        });
        expect(getMock).toHaveBeenCalledWith("/profile/picture/signed-upload");
        expect(postMock).toHaveBeenCalledWith("/profile/picture", {
            profilePicture: "https://res.cloudinary.com/your-cloud-name/image/upload/v1/avatar.jpg",
        });
        expect(progressValues[0]).toBe(0);
        expect(progressValues.at(-1)).toBe(100);
        expect(progressValues).toContain(5);
        expect(progressValues).toContain(95);
    });

    it("throws when Cloudinary does not return a URL", async () => {
        getMock.mockResolvedValue({
            body: { status: "success", data: signedUpload },
        });
        axiosPostMock.mockResolvedValue({ data: {} });

        const file = new File(["image"], "avatar.png", { type: "image/png" });
        Object.defineProperty(file, "size", { value: 1024 });

        await expect(uploadProfileImage(file)).rejects.toThrow(
            "Cloudinary upload succeeded but no image URL was returned.",
        );
        expect(postMock).not.toHaveBeenCalled();
    });

    it("deletes the profile picture via DELETE /profile/picture", async () => {
        deleteMock.mockResolvedValue({ body: { status: "success", data: { profilePicture: null } } });

        await deleteProfileImage();

        expect(deleteMock).toHaveBeenCalledWith("/profile/picture");
    });
});
