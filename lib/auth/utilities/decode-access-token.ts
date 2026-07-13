import { ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA } from "@/lib/auth/constants/two-factor.constant";
import { decodeJwtPayload } from "@/lib/auth/utilities/decode-jwt-payload";

/** Decoded payload from an admin access token JWT. */
export interface AdminAccessTokenPayload {
    status?: string;
    email?: string;
    obscuredMail?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    name?: string;
    roleName?: string;
    role?: string;
    roles?: string[];
    profilePicture?: string;
    profileImageUrl?: string;
    profileImage?: string;
    avatarUrl?: string;
    imageUrl?: string;
    iat?: number;
    exp?: number;
    [claimKey: string]: unknown;
}

/**
 * Decodes an admin access token payload without verifying its signature.
 * @param accessToken - JWT access token from login or sign-up.
 */
export function decodeAdminAccessTokenPayload(
    accessToken: string,
): AdminAccessTokenPayload | null {
    return decodeJwtPayload<AdminAccessTokenPayload>(accessToken);
}

/**
 * Returns true when the access token indicates 2FA setup is still required.
 * @param accessToken - JWT access token from login or sign-up.
 */
export function isPendingTwoFactorSetupAccessToken(accessToken: string): boolean {
    const accessTokenPayload = decodeAdminAccessTokenPayload(accessToken);

    return accessTokenPayload?.status === ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA;
}
