"use client";

import { AuthPrimaryButton, OtpHint, OtpInput } from "@/components/auth";
import Typography from "@/components/typography";
import { AUTH_OTP_LENGTH } from "@/lib/auth/constants/two-factor.constant";
import {
    TWO_FACTOR_QR_CODE_SIZE_PX,
} from "@/lib/auth/constants/two-factor.constant";
import type { FieldErrors, UseFormSetValue } from "react-hook-form";
import type { AdminVerify2FaFormValues } from "@/lib/auth/schemas";

type SetupTwoFactorStep = "SCAN_QR" | "CONFIRM_OTP";

interface SetupTwoFactorFlowProps {
    qrCodeImageUrl: string;
    manualEntryCode: string;
    setupStep: SetupTwoFactorStep;
    otpCode: string;
    isSubmitting: boolean;
    otpErrors: FieldErrors<AdminVerify2FaFormValues>;
    onContinue: () => void;
    onConfirmSetup: () => void;
    onOtpChange: UseFormSetValue<AdminVerify2FaFormValues>;
}

const SETUP_STEPS = [
    { id: "SCAN_QR", label: "Scan QR code" },
    { id: "CONFIRM_OTP", label: "Confirm code" },
] as const;

/** Two-step 2FA setup panel with QR scan and OTP confirmation. */
export function SetupTwoFactorFlow({
    qrCodeImageUrl,
    manualEntryCode,
    setupStep,
    otpCode,
    isSubmitting,
    otpErrors,
    onContinue,
    onConfirmSetup,
    onOtpChange,
}: SetupTwoFactorFlowProps) {
    const activeStepIndex = setupStep === "SCAN_QR" ? 0 : 1;

    return (
        <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-3">
                {SETUP_STEPS.map((step, stepIndex) => {
                    const isActive = stepIndex === activeStepIndex;
                    const isComplete = stepIndex < activeStepIndex;

                    return (
                        <div
                            key={step.id}
                            className={[
                                "rounded-xl border px-3 py-3 transition-colors",
                                isActive
                                    ? "border-[#51830033] bg-[#B1EC5214]"
                                    : isComplete
                                      ? "border-[#51830026] bg-[#FFFFFF]"
                                      : "border-[#0B0E0514] bg-[#0B0E0508]",
                            ].join(" ")}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={[
                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                        isActive || isComplete
                                            ? "bg-[#518300] text-white"
                                            : "bg-[#0B0E0514] text-[#0B0E05A3]",
                                    ].join(" ")}
                                >
                                    {isComplete ? "✓" : stepIndex + 1}
                                </span>
                                <Typography
                                    type="text14"
                                    fontWeight={isActive ? 600 : 500}
                                    className={isActive ? "!text-[#0B0E05]" : "!text-[#0B0E05A3]"}
                                >
                                    {step.label}
                                </Typography>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] shadow-[0_8px_30px_rgba(11,14,5,0.04)]">
                {setupStep === "SCAN_QR" ? (
                    <div className="px-6 py-5">
                        <Typography type="text16" fontWeight={600} className="!text-[#0B0E05]">
                            Link your authenticator app
                        </Typography>
                        <Typography type="text14" fontWeight={400} className="mt-1 !text-[#0B0E05A3]">
                            Open Google Authenticator, Authy, or 1Password and scan the code below.
                        </Typography>

                        <div className="mt-5 flex flex-col items-center gap-5">
                            <div className="rounded-2xl bg-[#0B0E050A] p-4">
                                <img
                                    src={qrCodeImageUrl}
                                    alt="QR code for authenticator app setup"
                                    width={TWO_FACTOR_QR_CODE_SIZE_PX}
                                    height={TWO_FACTOR_QR_CODE_SIZE_PX}
                                    className="rounded-xl bg-white p-3 shadow-sm"
                                />
                            </div>

                            <div className="w-full rounded-xl border border-dashed border-[#0B0E051F] bg-[#0B0E0508] px-4 py-3">
                                <Typography
                                    type="text12"
                                    fontWeight={500}
                                    className="text-center uppercase tracking-[0.12em] !text-[#0B0E05A3]"
                                >
                                    Manual entry code
                                </Typography>
                                <Typography
                                    type="text14"
                                    fontWeight={600}
                                    className="mt-2 text-center !font-mono !tracking-[0.18em] !text-[#518300]"
                                >
                                    {manualEntryCode}
                                </Typography>
                            </div>
                        </div>

                        <div className="mt-6">
                            <AuthPrimaryButton label="Continue" type="button" onClick={onContinue} />
                        </div>
                    </div>
                ) : null}

                {setupStep === "CONFIRM_OTP" ? (
                    <form className="space-y-4 px-6 py-5" onSubmit={onConfirmSetup} noValidate>
                        <div>
                            <Typography type="text16" fontWeight={600} className="!text-[#0B0E05]">
                                Confirm setup
                            </Typography>
                            <Typography type="text14" fontWeight={400} className="mt-1 !text-[#0B0E05A3]">
                                Enter the 6-digit code from your authenticator app to finish.
                            </Typography>
                        </div>

                        <OtpInput
                            value={otpCode}
                            onChange={(nextOtpCode) =>
                                onOtpChange("otpCode", nextOtpCode, { shouldValidate: true })
                            }
                            disabled={isSubmitting}
                        />
                        <OtpHint />

                        {otpErrors.otpCode?.message ? (
                            <Typography type="text14" fontWeight={500} className="!text-[#CC2929]">
                                {otpErrors.otpCode.message}
                            </Typography>
                        ) : null}

                        <AuthPrimaryButton
                            label="Confirm setup"
                            isLoading={isSubmitting}
                            disabled={otpCode.length !== AUTH_OTP_LENGTH}
                        />
                    </form>
                ) : null}
            </div>
        </div>
    );
}
