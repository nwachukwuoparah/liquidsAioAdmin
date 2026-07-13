"use client";

import {
    AuthLogo,
    AuthPageHeader,
    AuthSplitLayout,
    SetupTwoFactorFlow,
} from "@/components/auth";
import { ApiError } from "@/lib/api/api-error";
import { ADMIN_DASHBOARD_ROUTE, AUTH_LOGIN_ROUTE, AUTH_VERIFY_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import { TWO_FACTOR_SETUP_QR_POLL_INTERVAL_MS } from "@/lib/auth/constants/two-factor.constant";
import { useAuthForm } from "@/lib/auth/hooks/use-auth-form";
import { AUTH_FORM_SCHEMA } from "@/lib/auth/schemas";
import { adminGetAuthenticatorAppSetup, adminVerifyAuthenticatorAppSetup } from "@/lib/auth/services/admin-auth.service";
import {
    mergeAuthFlowWithSetupData,
    readSetupAuthFlowPayloadFromSearchParams,
} from "@/lib/auth/utilities/auth-flow-payload";
import { setAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { replaceBrowserHistoryRoute } from "@/lib/auth/utilities/replace-browser-history-route";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { json } from "zod";

type SetupTwoFactorStep = "SCAN_QR" | "CONFIRM_OTP";

function SetupTwoFactorForm() {
    const searchParams = useSearchParams();
    const authFlowPayload = useMemo(
        () => readSetupAuthFlowPayloadFromSearchParams(searchParams),
        [searchParams],
    );
    const setupToken = authFlowPayload?.setupToken ?? null;
    const [setupStep, setSetupStep] = useState<SetupTwoFactorStep>("SCAN_QR");

    const authenticatorSetupQuery = useQuery({
        queryKey: ["authenticator-app-setup", setupToken],
        queryFn: () => adminGetAuthenticatorAppSetup(setupToken!),
        enabled: Boolean(setupToken) && setupStep === "SCAN_QR",
        retry: 0,
        staleTime: 0,
        refetchInterval: setupStep === "SCAN_QR" ? TWO_FACTOR_SETUP_QR_POLL_INTERVAL_MS : false,
        refetchIntervalInBackground: setupStep === "SCAN_QR",
        refetchOnWindowFocus: setupStep === "SCAN_QR",
    });

    const verifySetupMutation = useMutation({
        mutationKey: ["authenticator-app-verify", setupToken],
        mutationFn: (otpCode: string) =>
            adminVerifyAuthenticatorAppSetup({
                setupToken: setupToken!,
                code: otpCode,
            }),
        retry: 0,
    });

    const setupViewData = useMemo(() => {
        if (!authFlowPayload || !authenticatorSetupQuery.data) {
            return null;
        }

        return mergeAuthFlowWithSetupData(authFlowPayload, authenticatorSetupQuery.data);
    }, [authFlowPayload, authenticatorSetupQuery.data]);

    useEffect(() => {
        if (!authenticatorSetupQuery.error) {
            return;
        }

        if (authenticatorSetupQuery.error instanceof ApiError) {
            console.error("authenticatorSetupQuery failed", {
                message: authenticatorSetupQuery.error.message,
                statusCode: authenticatorSetupQuery.error.statusCode,
                fieldKey: authenticatorSetupQuery.error.fieldKey,
            });
            return;
        }

        console.error("authenticatorSetupQuery failed", authenticatorSetupQuery.error);
    }, [authenticatorSetupQuery.error]);

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

    const onConfirmSetup = handleSubmit(async (formValues) => {
        if (!setupViewData) {
            return;
        }

        try {
            const verifyResult = await verifySetupMutation.mutateAsync(formValues.otpCode);

            console.log("adminVerifyAuthenticatorAppSetup response", JSON.stringify(verifyResult, null, 2));

            if (!verifyResult.token) {
                toast.error("Setup verified but no session token was returned.");
                return;
            }
            replaceBrowserHistoryRoute(ADMIN_DASHBOARD_ROUTE);
            setAccessToken(verifyResult.token);
            toast.success(verifyResult.body.message ?? "Two-factor authentication enabled.");
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
                return;
            }

            toast.error("Unable to verify authenticator setup. Please try again.");
        }
    });

    if (!authFlowPayload || !setupToken) {
        return (
            <AuthSplitLayout>
                <div className="mx-auto w-full max-w-lg text-center">
                    <AuthLogo />
                    <AuthPageHeader
                        title="Session expired"
                        description="Your setup session is missing. Please log in again to continue setting up two-factor authentication."
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

    if (authenticatorSetupQuery.isPending) {
        return (
            <AuthSplitLayout>
                <div className="mx-auto w-full max-w-lg">
                    <AuthLogo />
                    <AuthPageHeader
                        title="Set up two-factor authentication"
                        description="Loading your authenticator setup details..."
                    />
                </div>
            </AuthSplitLayout>
        );
    }

    if (authenticatorSetupQuery.isError || !setupViewData) {
        const errorMessage =
            authenticatorSetupQuery.error instanceof ApiError
                ? authenticatorSetupQuery.error.message
                : "Unable to load authenticator setup details. Please try again.";

        return (
            <AuthSplitLayout>
                <div className="mx-auto w-full max-w-lg text-center">
                    <AuthLogo />
                    <AuthPageHeader
                        title="Unable to start 2FA setup"
                        description={errorMessage}
                    />
                    <button
                        type="button"
                        onClick={() => authenticatorSetupQuery.refetch()}
                        className="mt-6 text-sm font-semibold text-[#518300] hover:text-[#0B0E05]"
                    >
                        Try again
                    </button>
                </div>
            </AuthSplitLayout>
        );
    }

    return (
        <AuthSplitLayout>
            <div className="mx-auto w-full max-w-lg">
                <AuthLogo />

                <AuthPageHeader
                    title="Set up two-factor authentication"
                    description="Add an extra layer of security to your admin account in two quick steps."
                />

                <SetupTwoFactorFlow
                    qrCodeImageUrl={setupViewData.qrCodeImageUrl}
                    manualEntryCode={setupViewData.manualEntryCode}
                    setupStep={setupStep}
                    otpCode={otpCode}
                    isSubmitting={isSubmitting || verifySetupMutation.isPending}
                    otpErrors={errors}
                    onContinue={() => setSetupStep("CONFIRM_OTP")}
                    onConfirmSetup={onConfirmSetup}
                    onOtpChange={setValue}
                />
            </div>
        </AuthSplitLayout>
    );
}

/** Guides new users through QR scan and OTP confirmation on one screen. */
export default function SetupTwoFactorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFFFFF]" />}>
            <SetupTwoFactorForm />
        </Suspense>
    );
}
