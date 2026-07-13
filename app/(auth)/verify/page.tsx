"use client";

import {
    AuthLogo,
    AuthPageHeader,
    AuthPrimaryButton,
    AuthSplitLayout,
    OtpHint,
    OtpInput,
} from "@/components/auth";
import Typography from "@/components/typography";
import { ApiError } from "@/lib/api/api-error";
import {
    ADMIN_DASHBOARD_ROUTE,
    AUTH_LOGIN_ROUTE,
} from "@/lib/auth/constants/auth-routes.constant";
import { AUTH_OTP_LENGTH } from "@/lib/auth/constants/two-factor.constant";
import { useAdminVerify2Fa } from "@/lib/auth/hooks/use-admin-verify-2fa";
import { useAuthForm } from "@/lib/auth/hooks/use-auth-form";
import { AUTH_FORM_SCHEMA } from "@/lib/auth/schemas";
import { hasAuthSession, setAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { replaceBrowserHistoryRoute } from "@/lib/auth/utilities/replace-browser-history-route";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

type VerifySessionState = "LOADING" | "READY" | "MISSING";

function VerifyAuthenticationForm() {
    const { verify2FaMutation } = useAdminVerify2Fa();
    const [verifySessionState, setVerifySessionState] = useState<VerifySessionState>("LOADING");

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useAuthForm(AUTH_FORM_SCHEMA.VERIFY_2FA, {
        defaultValues: {
            otpCode: "",
        },
        mode: "onSubmit",
    });

    const otpCode = watch("otpCode");

    useEffect(() => {
        setVerifySessionState(hasAuthSession() ? "READY" : "MISSING");
    }, []);

    const onSubmit = handleSubmit(async (formValues) => {
        if (!hasAuthSession()) {
            toast.error("Your verification session has expired. Please log in again.");
            return;
        }

        try {
            const verifyResult = await verify2FaMutation.mutateAsync(formValues.otpCode);

            if (!verifyResult.token) {
                toast.error("Verification succeeded but no session token was returned.");
                return;
            }

            setAccessToken(verifyResult.token);
            toast.success(verifyResult.body.message ?? "Authentication verified.");
            replaceBrowserHistoryRoute(ADMIN_DASHBOARD_ROUTE);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
                return;
            }

            toast.error("Unable to verify authentication. Please try again.");
        }
    });

    if (verifySessionState === "LOADING") {
        return (
            <AuthSplitLayout>
                <div className="mx-auto w-full max-w-md">
                    <AuthLogo />
                    <AuthPageHeader
                        title="Verify authentication"
                        description="Enter the verification code from your authenticator app."
                    />
                </div>
            </AuthSplitLayout>
        );
    }

    if (verifySessionState === "MISSING") {
        return (
            <AuthSplitLayout>
                <div className="mx-auto w-full max-w-md text-center">
                    <AuthLogo />
                    <AuthPageHeader
                        title="Session expired"
                        description="Your verification session is missing. Please log in again to continue."
                    />
                    <Link
                        href={AUTH_LOGIN_ROUTE}
                        className="mt-6 inline-block text-sm font-semibold text-[#518300] hover:text-[#0B0E05]"
                    >
                        Back to login
                    </Link>
                </div>
            </AuthSplitLayout>
        );
    }

    return (
        <AuthSplitLayout>
            <div className="mx-auto w-full max-w-md">
                <AuthLogo />

                <AuthPageHeader
                    title="Verify authentication"
                    description="Enter the verification code from your authenticator app."
                />

                <form className="mt-8" onSubmit={onSubmit} noValidate>
                    <div className="space-y-4">
                        <OtpInput
                            value={otpCode}
                            onChange={(nextOtpCode) =>
                                setValue("otpCode", nextOtpCode, { shouldValidate: true })
                            }
                            disabled={isSubmitting || verify2FaMutation.isPending}
                        />
                        <OtpHint />

                        {errors.otpCode?.message ? (
                            <Typography type="text14" fontWeight={500} className="!text-[#CC2929]">
                                {errors.otpCode.message}
                            </Typography>
                        ) : null}
                    </div>

                    <div className="space-y-4 pt-8">
                        <AuthPrimaryButton
                            label="Verify and continue"
                            isLoading={isSubmitting || verify2FaMutation.isPending}
                            disabled={otpCode.length !== AUTH_OTP_LENGTH}
                        />

                        <div className="flex flex-col items-center gap-2 text-center">
                            <Link href={AUTH_LOGIN_ROUTE} className="text-sm text-[#0B0E05A3] hover:text-[#0B0E05]">
                                Back to login
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </AuthSplitLayout>
    );
}

/** Two-factor verification screen shown after 2FA setup to test the authenticator app. */
export default function VerifyAuthenticationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFFFFF]" />}>
            <VerifyAuthenticationForm />
        </Suspense>
    );
}
