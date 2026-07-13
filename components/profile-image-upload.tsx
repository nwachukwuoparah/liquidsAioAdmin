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
    onImageUrlChange?: (imageUrl: string | null) => void;
}

const AVATAR_RING_SIZE = 72;
const AVATAR_RING_STROKE = 3;
const AVATAR_RING_RADIUS = (AVATAR_RING_SIZE - AVATAR_RING_STROKE) / 2;
const AVATAR_RING_CIRCUMFERENCE = 2 * Math.PI * AVATAR_RING_RADIUS;

function ProfileInitialsAvatar({ name }: { name: string }) {
    return (
        <span className={`flex h-full w-full items-center justify-center text-sm font-bold ${PROFILE_AVATAR_CLASS}`}>
            {getInitialsFromName(name)}
        </span>
    );
}

function UploadProgressRing({ progress }: { progress: number }) {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const dashOffset = AVATAR_RING_CIRCUMFERENCE * (1 - clampedProgress / 100);

    return (
        <svg
            className="pointer-events-none absolute inset-0 -rotate-90"
            width={AVATAR_RING_SIZE}
            height={AVATAR_RING_SIZE}
            viewBox={`0 0 ${AVATAR_RING_SIZE} ${AVATAR_RING_SIZE}`}
            aria-hidden
        >
            <circle
                cx={AVATAR_RING_SIZE / 2}
                cy={AVATAR_RING_SIZE / 2}
                r={AVATAR_RING_RADIUS}
                fill="none"
                stroke="#FFFFFF33"
                strokeWidth={AVATAR_RING_STROKE}
            />
            <circle
                cx={AVATAR_RING_SIZE / 2}
                cy={AVATAR_RING_SIZE / 2}
                r={AVATAR_RING_RADIUS}
                fill="none"
                stroke="#B1EC52"
                strokeWidth={AVATAR_RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={AVATAR_RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-200 ease-out"
            />
        </svg>
    );
}

export function ProfileImageUpload({
    name,
    initialImageUrl = null,
    onImageUrlChange,
}: ProfileImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const previewUrl = localPreviewUrl ?? imageUrl;
    const hasUploadedPhoto = Boolean(previewUrl);
    const isBusy = isUploading || isDeleting;

    useEffect(() => {
        setImageUrl(initialImageUrl);
    }, [initialImageUrl]);

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
        setUploadProgress(0);

        try {
            const { imageUrl: uploadedImageUrl } = await uploadProfileImage(file, {
                onProgress: setUploadProgress,
            });
            setImageUrl(uploadedImageUrl);
            onImageUrlChange?.(uploadedImageUrl);
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
            setUploadProgress(0);
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
            onImageUrlChange?.(null);
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

    const actionButtonClass =
        "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border bg-[#FFFFFF] px-3.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

    return (
        <div className="space-y-3">
            <Typography type="text14" fontWeight={600} className="text-[#344054]">
                Profile image
            </Typography>

            <div className="flex flex-col items-start gap-3">
                <div
                    className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center"
                    role={isUploading ? "progressbar" : undefined}
                    aria-valuemin={isUploading ? 0 : undefined}
                    aria-valuemax={isUploading ? 100 : undefined}
                    aria-valuenow={isUploading ? uploadProgress : undefined}
                    aria-label={isUploading ? "Upload progress" : undefined}
                >
                    <div
                        className={`relative h-16 w-16 overflow-hidden rounded-full border border-[#E4E7EC] ${
                            isUploading ? "scale-[0.92] transition-transform duration-200" : ""
                        }`}
                    >
                        {previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewUrl}
                                alt="Profile"
                                className={`h-full w-full object-cover transition-[filter,opacity] duration-200 ${
                                    isUploading ? "scale-105 opacity-80 blur-[1px]" : ""
                                }`}
                            />
                        ) : (
                            <ProfileInitialsAvatar name={name} />
                        )}

                        {isUploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0E05]/45 backdrop-blur-[1px]">
                                <span className="text-[13px] font-bold leading-none tracking-tight text-white">
                                    {uploadProgress}%
                                </span>
                            </div>
                        ) : null}

                        {isDeleting ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E05]/40 backdrop-blur-[1px]">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            </div>
                        ) : null}
                    </div>

                    {isUploading ? <UploadProgressRing progress={uploadProgress} /> : null}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {isUploading ? (
                    <Typography type="text14" fontWeight={600} className="text-[#0B0E05]">
                        Uploading photo
                    </Typography>
                ) : (
                    <div className="flex items-center gap-2.5">
                        {!hasUploadedPhoto ? (
                            <button
                                type="button"
                                onClick={handleUploadClick}
                                disabled={isBusy}
                                className={`${actionButtonClass} border-[#0B0E0514] text-[#0B0E05] hover:bg-[#0B0E050A]`}
                            >
                                <CameraIcon className="h-4 w-4 shrink-0 text-[#0B0E05]" />
                                Upload image
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isBusy}
                                aria-label="Delete profile image"
                                className={`${actionButtonClass} border-[#FDA29B] text-[#D92D20] hover:bg-[#FEF3F2] disabled:opacity-50`}
                            >
                                <TrashIcon className="h-4 w-4 shrink-0 text-[#D92D20]" />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
