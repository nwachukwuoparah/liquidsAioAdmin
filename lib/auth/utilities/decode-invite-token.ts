import { decodeJwtPayload } from "@/lib/auth/utilities/decode-jwt-payload";

/** Decoded payload from an admin invite JWT. */
export interface AdminInviteTokenPayload {
    type?: string;
    target?: string;
    email?: string;
    roleName?: string;
    iat?: number;
    exp?: number;
}

/**
 * Decodes the payload of an invite JWT without verifying its signature.
 * @param inviteToken - JWT from the sign-up invite link query string.
 */
export function decodeInviteTokenPayload(inviteToken: string): AdminInviteTokenPayload | null {
    return decodeJwtPayload<AdminInviteTokenPayload>(inviteToken);
}

/**
 * Reads the invitee email from an invite JWT payload.
 * @param inviteToken - JWT from the sign-up invite link query string.
 */
export function getInviteEmailFromToken(inviteToken: string | null | undefined): string | null {
    if (!inviteToken) {
        return null;
    }

    const payload = decodeInviteTokenPayload(inviteToken);
    const inviteEmail = payload?.email?.trim();

    return inviteEmail || null;
}
