import {
    DEMO_TWO_FACTOR_SECRET,
    TWO_FACTOR_ISSUER_NAME,
} from "@/lib/auth/constants/two-factor.constant";

/**
 * Builds an otpauth URL for authenticator app QR codes.
 * @param accountEmail - Email address shown in the authenticator app.
 */
export function buildTwoFactorOtpAuthUrl(accountEmail: string): string {
    const encodedIssuer = encodeURIComponent(TWO_FACTOR_ISSUER_NAME);
    const encodedAccountEmail = encodeURIComponent(accountEmail);

    return `otpauth://totp/${encodedIssuer}:${encodedAccountEmail}?secret=${DEMO_TWO_FACTOR_SECRET}&issuer=${encodedIssuer}`;
}

/**
 * Builds a QR code image URL for the given otpauth payload.
 * @param otpAuthUrl - Authenticator otpauth URL to encode.
 */
export function buildTwoFactorQrCodeImageUrl(otpAuthUrl: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
}
