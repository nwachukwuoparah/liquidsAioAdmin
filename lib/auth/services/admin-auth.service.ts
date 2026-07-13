import { apiClient, type ApiJsonResult } from "@/lib/api/api-client";
import {
    ADMIN_AUTH_AUTHENTICATOR_APP_SETUP_PATH,
    ADMIN_AUTH_AUTHENTICATOR_APP_VERIFY_PATH,
    ADMIN_AUTH_SIGNUP_PATH,
    ADMIN_AUTH_VERIFY_2FA_CODE_PATH,
} from "@/lib/auth/constants/auth-api.constant";
import type { AdminSignUpRequestBody } from "@/lib/auth/schemas/sign-up.schema";
import {
    parseAuthenticatorAppSetupResponse,
    type AdminAuthenticatorAppSetupApiResponse,
    type ParsedAuthenticatorAppSetupData,
} from "@/lib/auth/utilities/parse-authenticator-app-setup-response";

/** Parsed JSON body from admin auth endpoints such as login and sign-up. */
export interface AdminAuthApiResponse {
    status?: string;
    message?: string;
    data?: unknown;
    token?: string;
}

export type AdminLoginResult = import("@/lib/auth/services/admin-login.service").AdminLoginResult;

export interface AdminSignupInput {
    inviteToken: string;
    inviteEmail: string;
    requestBody: AdminSignUpRequestBody;
}

export interface AdminSignupResult {
    email: string;
    setupToken: string | null;
    accessToken: string | null;
    message?: string;
    data?: unknown;
}
/**
 * Authenticates an admin user with email and password.
 * @param credentials - Login form values validated on the client.
 */
export { adminLogin } from "@/lib/auth/services/admin-login.service";

/**
 * Completes admin sign-up using an invite token.
 * @param signupInput - Invite token, invitee email, and validated sign-up payload.
 */
export async function adminSignup(signupInput: AdminSignupInput): Promise<AdminSignupResult> {
    const { setupToken, token: accessToken, body } = await apiClient.post<AdminAuthApiResponse>(
        ADMIN_AUTH_SIGNUP_PATH,
        signupInput.requestBody,
        {
            token: signupInput.inviteToken,
        },
    );

    return {
        email: signupInput.inviteEmail,
        setupToken,
        accessToken,
        message: body.message,
        data: body.data,
    };
}

/**
 * Fetches QR code and manual entry details for admin authenticator app setup.
 * @param setupToken - Admin setup token from the invite or login flow (`token` header).
 */
export async function adminGetAuthenticatorAppSetup(
    setupToken: string,
): Promise<ParsedAuthenticatorAppSetupData> {
    const { body } = await apiClient.get<AdminAuthenticatorAppSetupApiResponse>(
        ADMIN_AUTH_AUTHENTICATOR_APP_SETUP_PATH,
        undefined,
        {
            token: setupToken,
        },
    );

    return parseAuthenticatorAppSetupResponse(body);
}

export interface AdminVerifyAuthenticatorAppSetupInput {
    setupToken: string;
    code: string;
}

export type AdminVerifyAuthenticatorAppSetupResult = ApiJsonResult<AdminAuthApiResponse>;

/**
 * Verifies admin authenticator app setup with a 6-digit OTP code.
 * @param verifyInput - Setup token header value and OTP code from the authenticator app.
 */
export async function adminVerifyAuthenticatorAppSetup(
    verifyInput: AdminVerifyAuthenticatorAppSetupInput,
): Promise<AdminVerifyAuthenticatorAppSetupResult> {
    return apiClient.post<AdminAuthApiResponse>(
        ADMIN_AUTH_AUTHENTICATOR_APP_VERIFY_PATH,
        {
            code: verifyInput.code,
        },
        {
            token: verifyInput.setupToken,
        },
    );
}

export type AdminVerify2FaCodeResult = ApiJsonResult<AdminAuthApiResponse>;

/**
 * Verifies an admin 2FA challenge with a 6-digit authenticator app code.
 * Uses the access token stored in the x-laioat cookie as the Bearer token.
 * @param code - OTP code from the authenticator app.
 */
export async function adminVerify2FaCode(code: string): Promise<AdminVerify2FaCodeResult> {
    return apiClient.post<AdminAuthApiResponse>(ADMIN_AUTH_VERIFY_2FA_CODE_PATH, {
        code,
    });
}
