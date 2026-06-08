const PROFILE_IMAGE_ENDPOINT =
    process.env.NEXT_PUBLIC_API_BASE_URL
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/profile/image`
        : "/api/admin/profile/image";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function getProfileImageEndpoint() {
    return PROFILE_IMAGE_ENDPOINT;
}

export function validateProfileImageFile(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
        return "Please select a JPG, PNG, WEBP, or GIF image.";
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return "Image must be 5 MB or smaller.";
    }

    return null;
}

export async function uploadProfileImage(
    file: File,
    fetchImpl: typeof fetch = fetch,
): Promise<{ imageUrl: string }> {
    const validationError = validateProfileImageFile(file);
    if (validationError) {
        throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetchImpl(PROFILE_IMAGE_ENDPOINT, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to upload profile image.");
    }

    const data = (await response.json()) as { imageUrl?: string };
    if (!data.imageUrl) {
        throw new Error("Upload succeeded but no image URL was returned.");
    }

    return { imageUrl: data.imageUrl };
}

export async function deleteProfileImage(fetchImpl: typeof fetch = fetch): Promise<void> {
    const response = await fetchImpl(PROFILE_IMAGE_ENDPOINT, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete profile image.");
    }
}
