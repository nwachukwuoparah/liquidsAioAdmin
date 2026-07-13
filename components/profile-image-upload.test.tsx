import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileImageUpload } from "./profile-image-upload";

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("@/lib/profile-image", () => ({
    uploadProfileImage: vi.fn(),
    deleteProfileImage: vi.fn(),
    validateProfileImageFile: vi.fn(() => null),
}));

import { toast } from "sonner";
import { deleteProfileImage, uploadProfileImage } from "@/lib/profile-image";

describe("ProfileImageUpload", () => {
    afterEach(() => {
        vi.clearAllMocks();
        URL.revokeObjectURL = vi.fn();
    });

    it("shows upload button when no image is uploaded", () => {
        render(<ProfileImageUpload name="Samuel Nathaniel" />);

        expect(screen.getByText("SN")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload image" })).toBeEnabled();
        expect(screen.queryByRole("button", { name: "Delete profile image" })).not.toBeInTheDocument();
    });

    it("shows delete button after an image is uploaded", async () => {
        vi.mocked(uploadProfileImage).mockResolvedValue({ imageUrl: "https://cdn.example.com/avatar.png" });

        render(<ProfileImageUpload name="Samuel Nathaniel" />);

        const file = new File(["image"], "avatar.png", { type: "image/png" });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Delete profile image" })).toBeEnabled();
        });

        expect(screen.queryByRole("button", { name: "Upload image" })).not.toBeInTheDocument();
    });

    it("uploads immediately when a file is selected and shows progress", async () => {
        let resolveUpload!: (value: { imageUrl: string }) => void;
        const uploadPromise = new Promise<{ imageUrl: string }>((resolve) => {
            resolveUpload = resolve;
        });

        vi.mocked(uploadProfileImage).mockImplementation(async (_file, options) => {
            options?.onProgress?.(12);
            options?.onProgress?.(67);
            return uploadPromise;
        });

        render(<ProfileImageUpload name="Samuel Nathaniel" />);

        const file = new File(["image"], "avatar.png", { type: "image/png" });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        const progressbar = await screen.findByRole("progressbar", { name: "Upload progress" });
        expect(progressbar).toHaveAttribute("aria-valuenow", "67");
        expect(screen.getByText("67%")).toBeInTheDocument();
        expect(screen.getByText("Uploading photo")).toBeInTheDocument();

        resolveUpload({ imageUrl: "https://cdn.example.com/avatar.png" });

        await waitFor(() => {
            expect(uploadProfileImage).toHaveBeenCalledWith(file, {
                onProgress: expect.any(Function),
            });
            expect(toast.success).toHaveBeenCalledWith("Profile image updated.");
        });

        expect(screen.getByRole("img", { name: "Profile" })).toHaveAttribute(
            "src",
            "https://cdn.example.com/avatar.png",
        );
        expect(screen.queryByRole("progressbar", { name: "Upload progress" })).not.toBeInTheDocument();
    });

    it("shows only delete when an initial image exists", () => {
        render(<ProfileImageUpload name="Samuel Nathaniel" initialImageUrl="https://cdn.example.com/avatar.png" />);

        expect(screen.getByRole("button", { name: "Delete profile image" })).toBeEnabled();
        expect(screen.queryByRole("button", { name: "Upload image" })).not.toBeInTheDocument();
    });

    it("shows upload button again after delete", async () => {
        vi.mocked(deleteProfileImage).mockResolvedValue();

        render(<ProfileImageUpload name="Samuel Nathaniel" initialImageUrl="https://cdn.example.com/avatar.png" />);

        fireEvent.click(screen.getByRole("button", { name: "Delete profile image" }));

        await waitFor(() => {
            expect(deleteProfileImage).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith("Profile image removed.");
            expect(screen.getByRole("button", { name: "Upload image" })).toBeEnabled();
        });

        expect(screen.queryByRole("button", { name: "Delete profile image" })).not.toBeInTheDocument();
        expect(screen.queryByRole("img", { name: "Profile" })).not.toBeInTheDocument();
        expect(screen.getByText("SN")).toBeInTheDocument();
    });

    it("keeps the image and shows an error when delete fails", async () => {
        vi.mocked(deleteProfileImage).mockRejectedValue(new Error("Failed to delete profile image."));

        render(<ProfileImageUpload name="Samuel Nathaniel" initialImageUrl="https://cdn.example.com/avatar.png" />);

        fireEvent.click(screen.getByRole("button", { name: "Delete profile image" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to delete profile image.");
        });

        expect(screen.getByRole("img", { name: "Profile" })).toHaveAttribute(
            "src",
            "https://cdn.example.com/avatar.png",
        );
        expect(screen.getByRole("button", { name: "Delete profile image" })).toBeEnabled();
    });
});
