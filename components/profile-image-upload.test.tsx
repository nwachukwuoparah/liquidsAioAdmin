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

    it("shows initials avatar from name when no image is uploaded", () => {
        render(<ProfileImageUpload name="Samuel Nathaniel" />);

        expect(screen.getByText("SN")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload image" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Delete profile image" })).toBeDisabled();
    });

    it("uploads immediately when a file is selected", async () => {
        vi.mocked(uploadProfileImage).mockResolvedValue({ imageUrl: "https://cdn.example.com/avatar.png" });

        render(<ProfileImageUpload name="Samuel Nathaniel" />);

        const file = new File(["image"], "avatar.png", { type: "image/png" });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(uploadProfileImage).toHaveBeenCalledWith(file);
            expect(toast.success).toHaveBeenCalledWith("Profile image updated.");
        });

        expect(screen.getByRole("img", { name: "Profile" })).toHaveAttribute(
            "src",
            "https://cdn.example.com/avatar.png",
        );
    });

    it("deletes the profile image via API", async () => {
        vi.mocked(deleteProfileImage).mockResolvedValue();

        render(<ProfileImageUpload name="Samuel Nathaniel" initialImageUrl="https://cdn.example.com/avatar.png" />);

        fireEvent.click(screen.getByRole("button", { name: "Delete profile image" }));

        await waitFor(() => {
            expect(deleteProfileImage).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith("Profile image removed.");
        });

        expect(screen.queryByRole("img", { name: "Profile" })).not.toBeInTheDocument();
        expect(screen.getByText("SN")).toBeInTheDocument();
    });
});
