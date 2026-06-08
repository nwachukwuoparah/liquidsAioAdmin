"use client";

import Typography from "@/components/typography";
import { CameraIcon, TrashIcon } from "@/components/vector";
import { getInitialsFromName, PROFILE_AVATAR_CLASS } from "@/lib/profile-avatar";
import { deleteProfileImage, uploadProfileImage, validateProfileImageFile } from "@/lib/profile-image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileImageUploadProps {
    name: string;
    initialImageUrl?: string | null;
}

function ProfileInitialsAvatar({ name }: { name: string }) {
    return (
        <span className={`flex h-full w-full items-center justify-center text-sm font-bold ${PROFILE_AVATAR_CLASS}`}>
            {getInitialsFromName(name)}
        </span>
    );
}

export function ProfileImageUpload({ name, initialImageUrl = null }: ProfileImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const previewUrl = localPreviewUrl ?? imageUrl;
    const hasUploadedPhoto = Boolean(previewUrl);
    const isBusy = isUploading || isDeleting;

    useEffect(() => {
        return () => {
            if (localPreviewUrl) {
                URL.revokeObjectURL(localPreviewUrl);
            }
        };
    }, [localPreviewUrl]);

    const handleUploadClick = () => {
        if (!isBusy) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        const validationError = validateProfileImageFile(file);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        setLocalPreviewUrl((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }
            return nextPreviewUrl;
        });

        setIsUploading(true);

        try {
            const { imageUrl: uploadedImageUrl } = await uploadProfileImage(file);
            setImageUrl(uploadedImageUrl);
            setLocalPreviewUrl((current) => {
                if (current) {
                    URL.revokeObjectURL(current);
                }
                return null;
            });
            toast.success("Profile image updated.");
        } catch (error) {
            setLocalPreviewUrl((current) => {
                if (current) {
                    URL.revokeObjectURL(current);
                }
                return null;
            });
            toast.error(error instanceof Error ? error.message : "Failed to upload profile image.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!hasUploadedPhoto || isBusy) {
            return;
        }

        setIsDeleting(true);

        try {
            await deleteProfileImage();
            setImageUrl(null);
            setLocalPreviewUrl((current) => {
                if (current) {
                    URL.revokeObjectURL(current);
                }
                return null;
            });
            toast.success("Profile image removed.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete profile image.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-3">
            <Typography type="text14" fontWeight={600} className="text-[#344054]">
                Profile image
            </Typography>

            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E4E7EC]">
                {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    <ProfileInitialsAvatar name={name} />
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={isBusy}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#0B0E05] transition-colors hover:bg-[#0B0E050A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <CameraIcon className="h-4 w-4 shrink-0 text-[#0B0E05]" />
                    {isUploading ? "Uploading..." : "Upload image"}
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isBusy || !hasUploadedPhoto}
                    aria-label="Delete profile image"
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#FDA29B] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#D92D20] transition-colors hover:bg-[#FEF3F2] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <TrashIcon className="h-4 w-4 shrink-0 text-[#D92D20]" />
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
            </div>
        </div>
    );
}
