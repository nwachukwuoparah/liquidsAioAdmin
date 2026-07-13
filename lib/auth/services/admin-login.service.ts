import { apiClient } from "@/lib/api/api-client";
import { ADMIN_AUTH_LOGIN_PATH } from "@/lib/auth/constants/auth-api.constant";
import type { AdminLoginFormValues } from "@/lib/auth/schemas/login.schema";

/** Parsed JSON body from the admin login endpoint. */
export interface AdminLoginApiResponse {
    status?: string;
    message?: string;
    data?: unknown;
}

/** Parsed login response with optional auth tokens from response headers. */
export interface AdminLoginResult {
    setupToken: string | null;
    token: string | null;
    refreshTokenExpiry: string | null;
    body: AdminLoginApiResponse;
}

/**
 * Authenticates an admin user with email and password.
 * @param credentials - Login form values validated on the client.
 */
export async function adminLogin(credentials: AdminLoginFormValues): Promise<AdminLoginResult> {
    const { setupToken, token, refreshTokenExpiry, body } = await apiClient.post<AdminLoginApiResponse>(
        ADMIN_AUTH_LOGIN_PATH,
        {
            email: credentials.email.trim(),
            password: credentials.password,
        },
    );

    return {
        setupToken,
        token,
        refreshTokenExpiry,
        body,
    };
}
