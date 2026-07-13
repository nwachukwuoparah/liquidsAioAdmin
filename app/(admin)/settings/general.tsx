"use client";

import Typography from "@/components/typography";
import { AuthPhoneInput } from "@/components/auth/auth-phone-input";
import { ApproveCheckIcon, PencilSimpleLineIcon } from "@/components/vector";
import { GeneralSettingsSkeleton } from "@/components/skeletons";
import { CARD_BG_CLASS } from "@/lib/card-styles";
import { useAdminSettingsGeneral, useAdminSettingsGeneralSave } from "@/lib/admin/hooks";
import {
    adminSettingsGeneralSchema,
    type AdminSettingsGeneralFormInput,
    type AdminSettingsGeneralFormValues,
} from "@/lib/admin/schemas/admin-settings-general.schema";
import { toAdminSettingsGeneralRequestBody } from "@/lib/admin/utilities/to-admin-settings-general-request-body";
import { DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE } from "@/lib/auth/constants/sign-up.constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";

export const GeneralSettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const {
        control,
        register,
        reset,
        handleSubmit,
        formState: { errors, isDirty },
        clearErrors,
    } = useForm<AdminSettingsGeneralFormInput, unknown, AdminSettingsGeneralFormValues>({
        resolver: zodResolver(adminSettingsGeneralSchema),
        defaultValues: {
            contactEmail: "",
            phoneNumber: "",
        },
        mode: "onSubmit",
    });
    const generalSettingsQuery = useAdminSettingsGeneral();
    const saveGeneralSettingsMutation = useAdminSettingsGeneralSave();
    const companyInfo = generalSettingsQuery.data;
    const phoneInputKey = `${companyInfo?.phoneNumber ?? ""}-${generalSettingsQuery.dataUpdatedAt}`;
    const isSaving = saveGeneralSettingsMutation.isPending;
    const isSaveActive = isDirty && !isSaving;

    useEffect(() => {
        if (!generalSettingsQuery.isSuccess) {
            return;
        }

        reset({
            contactEmail: companyInfo?.contactEmail ?? "",
            phoneNumber: companyInfo?.phoneNumber ?? "",
        });
        clearErrors();
    }, [generalSettingsQuery.isSuccess, companyInfo, reset, clearErrors]);

    const onValidSave = async (formValues: AdminSettingsGeneralFormValues) => {
        await saveGeneralSettingsMutation.mutateAsync(
            toAdminSettingsGeneralRequestBody(formValues),
        );
        setIsEditing(false);
    };

    const handleHeaderAction = () => {
        if (!isEditing) {
            clearErrors();
            setIsEditing(true);
            return;
        }

        if (!isDirty) {
            clearErrors();
            setIsEditing(false);
            return;
        }

        void handleSubmit(onValidSave)();
    };

    return (
        <div className={`flex h-[100vh] w-full justify-center rounded-[12px] border border-[#0B0E0514] md:p-12 ${CARD_BG_CLASS}`}>
            <div className="w-full bg-[#FFFFFF] p-4 lg:w-[45%]">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <Typography type="text20" fontWeight={700} className="text-slate-900">
                            General settings
                        </Typography>
                        <Typography type="text14" className="mt-1 leading-normal">
                            Basic platform contact details used for system alerts and user support
                        </Typography>
                    </div>

                    <button
                        type="button"
                        aria-label={isEditing ? "Save general settings" : "Edit general settings"}
                        onClick={handleHeaderAction}
                        disabled={generalSettingsQuery.isLoading || isSaving}
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
                        <Typography type="text12" fontWeight={700} className="!text-[#0B0E05]">
                            {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
                        </Typography>
                    </button>
                </div>

                <div className="mb-6 border-b border-[#0B0E0514]" />

                {generalSettingsQuery.isLoading ? (
                    <GeneralSettingsSkeleton />
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col space-y-2">
                            <Typography
                                type="text14"
                                fontWeight={700}
                                className="block tracking-wider text-[#0B0E05]"
                            >
                                Contact email
                            </Typography>
                            <Typography type="text12" className="block leading-normal text-[#00000FA3]">
                                This email will receive important system notifications and user support
                                messages. This is different from your personal account email.
                            </Typography>
                            <div
                                className={`w-full rounded-xl border transition-all ${
                                    errors.contactEmail
                                        ? "border-[#CC2929]"
                                        : "border-[#0B0E0514]"
                                } ${isEditing ? "bg-[#FFFFFF]" : "bg-slate-50/70"}`}
                            >
                                <input
                                    type="email"
                                    aria-label="Contact email"
                                    aria-invalid={Boolean(errors.contactEmail)}
                                    aria-describedby={
                                        errors.contactEmail ? "contact-email-error" : undefined
                                    }
                                    disabled={!isEditing}
                                    className="w-full bg-transparent px-4 py-3 text-[13px] font-medium text-slate-800 outline-none disabled:cursor-default"
                                    {...register("contactEmail")}
                                />
                            </div>
                            {errors.contactEmail ? (
                                <p id="contact-email-error" className="text-sm text-[#CC2929]">
                                    {errors.contactEmail.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Typography
                                type="text12"
                                fontWeight={700}
                                className="block tracking-wider text-[#0B0E05]"
                            >
                                Support phone
                            </Typography>
                            <Typography type="text12" className="block leading-normal text-[#00000FA3]">
                                Displayed on help pages and used for urgent communications from verified
                                partners.
                            </Typography>
                            <AuthPhoneInput
                                key={phoneInputKey}
                                control={control}
                                name="phoneNumber"
                                showLabel={false}
                                disabled={!isEditing}
                                defaultCountry={DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE}
                                inputAriaLabel="Support phone"
                                errorMessage={errors.phoneNumber?.message}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
