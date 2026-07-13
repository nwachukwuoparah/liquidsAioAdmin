"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthPhoneInput } from "@/components/auth/auth-phone-input";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { ProfileSettingsSkeleton } from "@/components/skeletons";
import Typography from "@/components/typography";
import { ApproveCheckIcon, PencilSimpleLineIcon } from "@/components/vector";
import { useAdminSettingsProfile, useAdminSettingsProfileSave } from "@/lib/admin/hooks";
import {
    adminSettingsProfileSchema,
    type AdminSettingsProfileFormInput,
    type AdminSettingsProfileFormValues,
} from "@/lib/admin/schemas/admin-settings-profile.schema";
import { toAdminSettingsProfileRequestBody } from "@/lib/admin/utilities/to-admin-settings-profile-request-body";
import { CARD_BG_CLASS } from "@/lib/card-styles";
import { DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE } from "@/lib/auth/constants/sign-up.constant";

const PROFILE_CARD_CLASS = `rounded-2xl border border-[#0B0E0514] ${CARD_BG_CLASS}`;

const fieldWrapperClass = (isEditing: boolean, hasError = false) =>
    `w-full rounded-xl border transition-all ${
        hasError
            ? "border-[#CC2929]"
            : "border-[#0B0E0514]"
    } ${isEditing ? CARD_BG_CLASS : "bg-slate-50/70"}`;

const fieldInputClass =
    "w-full bg-transparent px-4 py-3 text-[13px] font-medium text-slate-800 outline-none disabled:cursor-default";

export const ProfileSettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const profileQuery = useAdminSettingsProfile();
    const saveProfileMutation = useAdminSettingsProfileSave();
    const {
        control,
        register,
        reset,
        handleSubmit,
        watch,
        formState: { errors, isDirty },
        clearErrors,
    } = useForm<AdminSettingsProfileFormInput, unknown, AdminSettingsProfileFormValues>({
        resolver: zodResolver(adminSettingsProfileSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
        },
        mode: "onSubmit",
    });

    const profileData = profileQuery.data;
    const phoneInputKey = `${profileData?.phone ?? ""}-${profileQuery.dataUpdatedAt}`;
    const watchedFullName = watch("fullName");
    const isSaving = saveProfileMutation.isPending;
    const isSaveActive = isDirty && !isSaving;

    useEffect(() => {
        if (!profileQuery.isSuccess || !profileData) {
            return;
        }

        reset({
            fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
            phoneNumber: profileData.phone,
        });
        setEmail(profileData.email);
        setProfileImageUrl(profileData.profileImageUrl ?? null);
        clearErrors();
    }, [profileQuery.isSuccess, profileData, reset, clearErrors]);

    const onValidSave = async (formValues: AdminSettingsProfileFormValues) => {
        await saveProfileMutation.mutateAsync(toAdminSettingsProfileRequestBody(formValues));
        setIsEditing(false);
    };

    const handleHeaderAction = () => {
        if (!isEditing) {
            clearErrors();
            setIsEditing(true);
            return;
        }

        // No edits: leave edit mode without calling the API.
        if (!isDirty) {
            clearErrors();
            setIsEditing(false);
            return;
        }

        void handleSubmit(onValidSave)();
    };

    return (
        <div
            className={`min-h-screen w-full font-sans antialiased lg:min-h-0 lg:rounded-[12px] lg:border lg:border-[#0B0E0514] ${CARD_BG_CLASS}`}
        >
            <div className="mx-auto w-full max-w-[600px] space-y-4 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <Typography type="text20" fontWeight={700} className="text-[#101828] md:text-xl">
                        Profile settings
                    </Typography>

                    <button
                        type="button"
                        aria-label={isEditing ? "Save profile settings" : "Edit profile settings"}
                        onClick={handleHeaderAction}
                        disabled={profileQuery.isLoading || isSaving}
                        className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 transition-all ${
                            isEditing
                                ? isSaveActive || isSaving
                                    ? "cursor-pointer border border-transparent bg-[#B1EC52]"
                                    : "cursor-pointer border border-[#0B0E0514] bg-[#F2F4F7] opacity-70"
                                : "cursor-pointer border border-[#0B0E0514] bg-[#FFFFFF] hover:bg-[#0B0E050A]"
                        }`}
                    >
                        {isSaving ? (
                            <span
                                className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#0B0E05]/25 border-t-[#0B0E05]"
                                aria-hidden
                            />
                        ) : isEditing ? (
                            <ApproveCheckIcon className="h-3 w-4 shrink-0 text-[#0B0E05]" />
                        ) : (
                            <PencilSimpleLineIcon className="h-4 w-4 shrink-0 text-[#0B0E05]" />
                        )}
                        <Typography type="text12" fontWeight={700} className="text-[#0B0E05]">
                            {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
                        </Typography>
                    </button>
                </div>

                <div className={`w-full space-y-6 p-4 md:p-6 ${PROFILE_CARD_CLASS}`}>
                    {profileQuery.isLoading ? (
                        <ProfileSettingsSkeleton />
                    ) : (
                        <>
                            <ProfileImageUpload
                                name={watchedFullName || "Admin user"}
                                initialImageUrl={profileImageUrl}
                                onImageUrlChange={setProfileImageUrl}
                            />

                            <div className="flex flex-col space-y-2">
                                <Typography type="text14" fontWeight={700} className="block text-[#0B0E05]">
                                    Full name
                                </Typography>
                                <div className={fieldWrapperClass(isEditing, Boolean(errors.fullName))}>
                                    <input
                                        type="text"
                                        aria-label="Full name"
                                        aria-invalid={Boolean(errors.fullName)}
                                        aria-describedby={errors.fullName ? "full-name-error" : undefined}
                                        disabled={!isEditing}
                                        className={fieldInputClass}
                                        {...register("fullName")}
                                    />
                                </div>
                                {errors.fullName ? (
                                    <p id="full-name-error" className="text-sm text-[#CC2929]">
                                        {errors.fullName.message}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex flex-col space-y-2">
                                <Typography type="text14" fontWeight={700} className="block text-[#0B0E05]">
                                    Phone number
                                </Typography>
                                <AuthPhoneInput
                                    key={phoneInputKey}
                                    control={control}
                                    name="phoneNumber"
                                    showLabel={false}
                                    disabled={!isEditing}
                                    defaultCountry={DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE}
                                    inputAriaLabel="Phone number"
                                    errorMessage={errors.phoneNumber?.message}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    <Typography type="text16" fontWeight={700} className="tracking-tight text-[#101828]">
                        Account settings
                    </Typography>

                    <div className={`flex w-full items-center justify-between p-4 ${PROFILE_CARD_CLASS}`}>
                        <div className="space-y-0.5">
                            <div className="flex flex-col">
                                <Typography type="text14" fontWeight={700} className="text-[#101828]">
                                    Change email
                                </Typography>
                                <Typography type="text14" className="block text-[#344054]">
                                    {email ? `[${email}]` : "[—]"}
                                </Typography>
                            </div>
                            <Typography type="text12" className="block pt-0.5 text-[#667085]">
                                Update the email linked to your your admin account.
                            </Typography>
                        </div>
                        <button className="ml-4 flex shrink-0 cursor-pointer items-center gap-2 border-l border-[#0B0E0514] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#344054] transition-colors hover:bg-gray-50">
                            <PencilSimpleLineIcon className="h-3.5 w-3.5 shrink-0 text-[#475467]" />
                            Edit
                        </button>
                    </div>

                    <div className={`flex w-full items-center justify-between p-4 ${PROFILE_CARD_CLASS}`}>
                        <div className="space-y-0.5">
                            <div className="flex flex-col">
                                <Typography type="text14" fontWeight={700} className="text-[#101828]">
                                    Change password
                                </Typography>
                                <Typography
                                    type="text14"
                                    className="block font-bold tracking-widest text-[#344054]"
                                >
                                    [••••••••••••••••••••]
                                </Typography>
                            </div>
                            <Typography type="text12" className="block pt-0.5 text-[#667085]">
                                Choose a strong password to keep your account secure.
                            </Typography>
                        </div>
                        <button className="ml-4 flex shrink-0 cursor-pointer items-center gap-2 border-l border-[#0B0E0514] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#344054] transition-colors hover:bg-gray-50">
                            <PencilSimpleLineIcon className="h-3.5 w-3.5 shrink-0 text-[#475467]" />
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
