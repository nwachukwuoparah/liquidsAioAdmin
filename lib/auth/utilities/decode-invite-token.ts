import { decodeJwtPayload } from "@/lib/auth/utilities/decode-jwt-payload";

/** Decoded payload from an admin invite JWT. */

/**
 * Decodes the payload of an invite JWT without verifying its signature.
 * @param inviteToken - JWT from the sign-up invite link query string.
 */
export function decodeInviteTokenPayload(inviteToken: string): any | null {
    return decodeJwtPayload<any>(inviteToken);
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
