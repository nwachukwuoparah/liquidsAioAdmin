import { buildTwoFactorQrCodeImageUrl } from "@/lib/auth/utilities/build-two-factor-otp-auth-url";

export interface AdminAuthenticatorAppSetupApiResponse {
    status?: string;
    message?: string;
    data?: {
        qrcode?: string;
        qrCode?: string;
        setupKey?: string;
        manualEntryCode?: string;
        secret?: string;
        otpauthUrl?: string;
    };
}

export interface ParsedAuthenticatorAppSetupData {
    qrCodeImageUrl: string;
    manualEntryCode: string;
}

/**
 * Parses QR code and manual entry details from the authenticator setup API.
 * @param responseBody - Raw setup response body from the backend.
 */
export function parseAuthenticatorAppSetupResponse(
    responseBody: AdminAuthenticatorAppSetupApiResponse,
): ParsedAuthenticatorAppSetupData {
    const setupData = responseBody.data ?? {};
    const manualEntryCode =
        setupData.setupKey ??
        setupData.manualEntryCode ??
        setupData.secret ??
        "";

    const qrCodeImageUrl =
        setupData.qrcode ??
        setupData.qrCode ??
        (setupData.otpauthUrl
            ? buildTwoFactorQrCodeImageUrl(setupData.otpauthUrl)
            : "");

    if (!manualEntryCode || !qrCodeImageUrl) {
        throw new Error("Authenticator setup details are missing from the server response.");
    }

    return {
        qrCodeImageUrl,
        manualEntryCode,
    };
}
