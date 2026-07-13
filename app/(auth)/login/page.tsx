"use client";

import { AuthFormField, AuthLogo, AuthPageHeader, AuthPrimaryButton, AuthSplitLayout, PasswordInput } from "@/components/auth";
import { useAdminLogin } from "@/lib/auth/hooks/use-admin-login";
import { useAuthForm } from "@/lib/auth/hooks/use-auth-form";
import { AUTH_FORM_SCHEMA } from "@/lib/auth/schemas";

/** Admin login screen with React Hook Form validation and API mutation. */
export default function LoginPage() {
    const loginMutation = useAdminLogin();
    const { register, handleSubmit, formState: { errors } } = useAuthForm(AUTH_FORM_SCHEMA.LOGIN, {
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onSubmit",
    });

    const onSubmit = handleSubmit((formValues) => {
        loginMutation.mutate(formValues);
    });

    return (
        <AuthSplitLayout>
            <div className="mx-auto w-full max-w-md">
                <AuthLogo />

                <AuthPageHeader
                    title="Login"
                    description="Welcome back. Enter account details to login."
                />

                <form className="mt-8" onSubmit={onSubmit} noValidate>
                    <div className="space-y-5">
                        <AuthFormField
                            label="Email"
                            type="email"
                            autoComplete="email"
                            placeholder="e.g. email@example.com"
                            errorMessage={errors.email?.message}
                            {...register("email")}
                        />

                        <PasswordInput
                            autoComplete="current-password"
                            placeholder="enter your password"
                            errorMessage={errors.password?.message}
                            {...register("password")}
                        />
                    </div>

                    <div className="space-y-5 pt-8">
                        <AuthPrimaryButton label="Login" isLoading={loginMutation.isPending} />
                    </div>
                </form>
            </div>
        </AuthSplitLayout>
    );
}
