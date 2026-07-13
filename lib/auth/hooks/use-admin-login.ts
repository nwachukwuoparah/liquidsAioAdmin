"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import type { AdminLoginFormValues } from "@/lib/auth/schemas";
import type { AdminLoginResult } from "@/lib/auth/services/admin-login.service";
import { adminLogin } from "@/lib/auth/services/admin-login.service";
import { AUTH_SETUP_2FA_ROUTE, AUTH_VERIFY_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import { clearAuthSession, setAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { buildAuthFlowUrl } from "@/lib/auth/utilities/build-auth-flow-url";
import { encodeSetupAuthFlowPayload } from "@/lib/auth/utilities/auth-flow-payload";
import { resolvePostLoginAuthRoute } from "@/lib/auth/utilities/resolve-post-login-auth-route";
import { replaceBrowserHistoryRoute } from "@/lib/auth/utilities/replace-browser-history-route";

/** TanStack Query mutation hook for admin login. */
export function useAdminLogin() {
    return useMutation({
        mutationKey: ["login"],
        mutationFn: (credentials: AdminLoginFormValues) => {
            clearAuthSession();
            return adminLogin(credentials);
        },
        retry: 0,
        onSuccess: (loginResult: AdminLoginResult) => {
            if (!loginResult.token) {
                toast.error("Login succeeded but no access token was returned.");
                return;
            }

            const loginData =
                typeof loginResult.body.data === "object" && loginResult.body.data !== null
                    ? loginResult.body.data
                    : undefined;

            const postLoginRoute = resolvePostLoginAuthRoute(loginResult.token);

            if (postLoginRoute === AUTH_SETUP_2FA_ROUTE) {
                if (!loginResult.setupToken) {
                    toast.error("Login succeeded but no setup token was returned.");
                    return;
                }

                replaceBrowserHistoryRoute(
                    buildAuthFlowUrl(
                        postLoginRoute,
                        encodeSetupAuthFlowPayload({
                            setupToken: loginResult.setupToken,
                            data: loginData,
                        }),
                    ),
                );
            } else {
                setAccessToken(loginResult.token);
                replaceBrowserHistoryRoute(AUTH_VERIFY_ROUTE);
            }

            toast.success(loginResult.body.message ?? "Logged in successfully.");
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
                return;
            }

            toast.error("Unable to log in. Please try again.");
        },
    });
}

export type { AdminLoginFormValues };
