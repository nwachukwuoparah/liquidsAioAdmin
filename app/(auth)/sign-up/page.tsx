"use client";

import {
    AuthFormField,
    AuthLogo,
    AuthPageHeader,
    AuthPhoneInput,
    AuthPrimaryButton,
    AuthSplitLayout,
    PasswordInput,
} from "@/components/auth";
import { ApiError } from "@/lib/api/api-error";
import {
    SIGN_UP_ACCESS_DENIED_MESSAGE,
    SIGN_UP_ACCESS_DENIED_TITLE,
} from "@/lib/auth/constants/sign-up.constant";
import { AUTH_SETUP_2FA_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import { useAuthForm } from "@/lib/auth/hooks/use-auth-form";
import { AUTH_FORM_SCHEMA, type AdminSignUpFormValues, toAdminSignUpRequestBody } from "@/lib/auth/schemas";
import { adminSignup } from "@/lib/auth/services/admin-auth.service";
import { clearEphemeralAuthFlowCookies } from "@/lib/auth/utilities/auth-token-storage";
import { getInviteEmailFromToken } from "@/lib/auth/utilities/decode-invite-token";
import { buildAuthFlowUrl } from "@/lib/auth/utilities/build-auth-flow-url";
import { encodeSetupAuthFlowPayload } from "@/lib/auth/utilities/auth-flow-payload";
import { replaceBrowserHistoryRoute } from "@/lib/auth/utilities/replace-browser-history-route";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";

function SignUpAccessDenied() {
    return (
        <AuthSplitLayout>
            <div className="mx-auto w-full max-w-md">
                <AuthLogo />

                <AuthPageHeader
                    title={SIGN_UP_ACCESS_DENIED_TITLE}
                    description={SIGN_UP_ACCESS_DENIED_MESSAGE}
                />
            </div>
        </AuthSplitLayout>
    );
}

function SignUpForm({
    inviteToken,
    inviteEmail,
}: {
    inviteToken: string;
    inviteEmail: string;
}) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useAuthForm(AUTH_FORM_SCHEMA.SIGN_UP, {
        defaultValues: {
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
        },
        mode: "onSubmit",
    });

    const signUpMutation = useMutation({
        mutationKey: ["auth", "admin", "signup"],
        mutationFn: (formValues: AdminSignUpFormValues) =>
            adminSignup({
                inviteToken,
                inviteEmail,
                requestBody: toAdminSignUpRequestBody(formValues),
            }),
        retry: 0,
        onSuccess: (signupResult) => {
            if (!signupResult.setupToken) {
                toast.error("Account created but no setup token was returned.");
                return;
            }

            const signupData =
                typeof signupResult.data === "object" && signupResult.data !== null
                    ? signupResult.data
                    : undefined;

            toast.success(signupResult.message ?? "Account created successfully.");
            clearEphemeralAuthFlowCookies();
            replaceBrowserHistoryRoute(
                buildAuthFlowUrl(
                    AUTH_SETUP_2FA_ROUTE,
                    encodeSetupAuthFlowPayload({
                        setupToken: signupResult.setupToken,
                        data: signupData,
                    }),
                ),
            );
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
                return;
            };
            
            toast.error("Unable to create account. Please try again.");
        },
    });

    const onSubmit = handleSubmit((_formValues) => {
        signUpMutation.mutate(_formValues);
    });

    return (
        <AuthSplitLayout>
            <div className="mx-auto w-full max-w-md">
                <AuthLogo />

                <AuthPageHeader
                    title="Create your account"
                    description="You've been invited to join LiquidsAIO Admin. Complete your profile to get started."
                />

                <form className="mt-8" onSubmit={onSubmit} noValidate>
                    <div className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <AuthFormField
                                label="First name"
                                autoComplete="given-name"
                                placeholder="e.g. Samuel"
                                errorMessage={errors.firstName?.message}
                                {...register("firstName")}
                            />
                            <AuthFormField
                                label="Last name"
                                autoComplete="family-name"
                                placeholder="e.g. Nathaniel"
                                errorMessage={errors.lastName?.message}
                                {...register("lastName")}
                            />
                        </div>

                        <AuthFormField
                            label="Email"
                            type="email"
                            autoComplete="email"
                            value={inviteEmail}
                            readOnly
                            disabled
                        />

                        <AuthPhoneInput
                            control={control}
                            name="phoneNumber"
                            errorMessage={errors.phoneNumber?.message}
                        />

                        <PasswordInput
                            label="Password"
                            autoComplete="new-password"
                            placeholder="Create a password"
                            errorMessage={errors.password?.message}
                            {...register("password")}
                        />

                        <PasswordInput
                            label="Confirm password"
                            autoComplete="new-password"
                            placeholder="Re-enter your password"
                            errorMessage={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                        />
                    </div>

                    <div className="pt-8">
                        <AuthPrimaryButton
                            label="Create account"
                            isLoading={signUpMutation.isPending}
                        />
                    </div>
                </form>
            </div>
        </AuthSplitLayout>
    );
}

function SignUpInviteGate() {
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get("token");
    const inviteEmail = getInviteEmailFromToken(inviteToken);

    if (!inviteToken || !inviteEmail) {
        return <SignUpAccessDenied />;
    }

    return <SignUpForm inviteToken={inviteToken} inviteEmail={inviteEmail} />;
}

/** Admin sign-up screen after accepting an invite link. */
export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFFFFF]" />}>
            <SignUpInviteGate />
        </Suspense>
    );
}
