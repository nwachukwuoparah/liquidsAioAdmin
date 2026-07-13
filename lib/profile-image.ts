import axios from "axios";
import {
    ADMIN_PROFILE_PICTURE_PATH,
    ADMIN_PROFILE_PICTURE_SIGNED_UPLOAD_PATH,
} from "@/lib/admin/constants/admin-api.constant";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";
import { apiClient } from "@/lib/api/api-client";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ProfilePictureSignedUploadPayload {
    timestamp: number;
    folder: string;
    overwrite: boolean;
    invalidate: boolean;
    public_id: string;
}

export interface ProfilePictureSignedUploadData {
    payload: ProfilePictureSignedUploadPayload;
    signature: string;
    cloudname: string;
    apiKey: string;
    expiresIn?: string;
}

export interface UploadProfileImageOptions {
    onProgress?: (percent: number) => void;
}

export interface UploadProfileImageResult {
    imageUrl: string;
}

function clampPercent(value: number): number {
    return Math.min(100, Math.max(0, Math.round(value)));
}

export function validateProfileImageFile(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
        return "Please select a JPG or PNG image.";
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return "Image must be 5 MB or smaller.";
    }

    return null;
}

/** Fetches Cloudinary signed-upload credentials for the signed-in admin. */
export async function fetchProfilePictureSignedUpload(): Promise<ProfilePictureSignedUploadData> {
    const response = await apiClient.get<unknown>(ADMIN_PROFILE_PICTURE_SIGNED_UPLOAD_PATH);
    const data = parseAdminApiResponseData<ProfilePictureSignedUploadData>(response.body);

    if (
        !data?.payload ||
        typeof data.signature !== "string" ||
        typeof data.cloudname !== "string" ||
        typeof data.apiKey !== "string"
    ) {
        throw new Error("Signed upload credentials were incomplete.");
    }

    return data;
}

/** Uploads a file to Cloudinary using signed credentials and reports progress. */
export async function uploadFileToCloudinary(
    file: File,
    signedUpload: ProfilePictureSignedUploadData,
    onProgress?: (percent: number) => void,
): Promise<string> {
    const formData = new FormData();
    const { payload, signature, cloudname, apiKey } = signedUpload;

    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(payload.timestamp));
    formData.append("signature", signature);
    formData.append("folder", payload.folder);
    formData.append("public_id", payload.public_id);
    formData.append("overwrite", String(payload.overwrite));
    formData.append("invalidate", String(payload.invalidate));

    const cloudinaryResponse = await axios.post<{ secure_url?: string; url?: string }>(
        `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
        formData,
        {
            onUploadProgress: (event) => {
                if (!onProgress || !event.total) {
                    return;
                }

                // Reserve the final 10% for saving the URL on the backend.
                onProgress(clampPercent((event.loaded / event.total) * 90));
            },
        },
    );

    const imageUrl = cloudinaryResponse.data.secure_url ?? cloudinaryResponse.data.url;
    if (!imageUrl) {
        throw new Error("Cloudinary upload succeeded but no image URL was returned.");
    }

    return imageUrl;
}

/** Persists the Cloudinary profile picture URL on the backend. */
export async function saveProfilePicture(profilePicture: string): Promise<void> {
    await apiClient.post(ADMIN_PROFILE_PICTURE_PATH, { profilePicture });
}

/**
 * Uploads a profile image: signed credentials → Cloudinary → save URL.
 * `onProgress` reports 0–100 across the full flow.
 */
export async function uploadProfileImage(
    file: File,
    options: UploadProfileImageOptions = {},
): Promise<UploadProfileImageResult> {
    const validationError = validateProfileImageFile(file);
    if (validationError) {
        throw new Error(validationError);
    }

    const { onProgress } = options;
    onProgress?.(0);

    const signedUpload = await fetchProfilePictureSignedUpload();
    onProgress?.(5);

    const imageUrl = await uploadFileToCloudinary(file, signedUpload, onProgress);
    onProgress?.(95);

    await saveProfilePicture(imageUrl);
    onProgress?.(100);

    return { imageUrl };
}

/** Removes the profile picture from Cloudinary and the backend. */
export async function deleteProfileImage(): Promise<void> {
    await apiClient.delete(ADMIN_PROFILE_PICTURE_PATH);
}
