import { apiClient } from "@/lib/api/api-client";
import { ADMIN_AUTH_LOGOUT_PATH } from "@/lib/auth/constants/auth-api.constant";

/** Parsed JSON body from the admin logout endpoint. */
export interface AdminLogoutApiResponse {
    status?: string;
    message?: string;
    data?: unknown;
}

/**
 * Logs out the current admin session.
 * Sends device headers and credentials so the backend can revoke the refresh token
 * and clear auth cookies.
 */
export async function adminLogout(): Promise<AdminLogoutApiResponse> {
    const { body } = await apiClient.post<AdminLogoutApiResponse>(ADMIN_AUTH_LOGOUT_PATH);
    return body;
}
