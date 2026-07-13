import { decodeAdminAccessTokenPayload } from "@/lib/auth/utilities/decode-access-token";
import { getInitialsFromName } from "@/lib/profile-avatar";

/** Resolved admin profile details shown in the dashboard header. */
export interface AdminSessionProfile {
    displayName: string;
    email: string;
    roleLabel: string;
    profileImageUrl: string | null;
    initials: string;
}

/** Fallback display name when the access token is missing or incomplete. */
export const DEFAULT_ADMIN_DISPLAY_NAME = "Admin User";

/** Fallback role label when the access token has no role claim. */
export const DEFAULT_ADMIN_ROLE_LABEL = "ADMIN";

/**
 * Resolves admin profile details from a stored access token JWT.
 * @param accessToken - JWT read from the client session cookie.
 */
export function resolveAdminSessionProfile(accessToken: string | null): AdminSessionProfile {
    if (!accessToken) {
        return buildDefaultAdminSessionProfile();
    }

    const accessTokenPayload = decodeAdminAccessTokenPayload(accessToken);

    if (!accessTokenPayload) {
        return buildDefaultAdminSessionProfile();
    }

    const displayName = resolveAdminDisplayName(accessTokenPayload);
    const email =
        readStringClaim(accessTokenPayload, "email", "obscuredMail") ??
        readStringClaimFromNestedRecords(accessTokenPayload, "email", "obscuredMail") ??
        "";
    const roleName =
        readStringClaim(accessTokenPayload, "roleName", "role") ??
        readStringClaimFromNestedRecords(accessTokenPayload, "roleName", "role") ??
        readFirstRoleClaim(accessTokenPayload);
    const profileImageUrl =
        readStringClaim(
            accessTokenPayload,
            "profilePicture",
            "profileImageUrl",
            "profileImage",
            "avatarUrl",
            "imageUrl",
        ) ??
        readStringClaimFromNestedRecords(
            accessTokenPayload,
            "profilePicture",
            "profileImageUrl",
            "profileImage",
            "avatarUrl",
            "imageUrl",
        );
    const resolvedDisplayName =
        displayName === DEFAULT_ADMIN_DISPLAY_NAME && email
            ? resolveDisplayNameFromEmail(email)
            : displayName;

    return {
        displayName: resolvedDisplayName,
        email,
        roleLabel: roleName ? formatAdminRoleLabel(roleName) : DEFAULT_ADMIN_ROLE_LABEL,
        profileImageUrl,
        initials: getInitialsFromName(resolvedDisplayName),
    };
}

function buildDefaultAdminSessionProfile(): AdminSessionProfile {
    return {
        displayName: DEFAULT_ADMIN_DISPLAY_NAME,
        email: "",
        roleLabel: DEFAULT_ADMIN_ROLE_LABEL,
        profileImageUrl: null,
        initials: getInitialsFromName(DEFAULT_ADMIN_DISPLAY_NAME),
    };
}

function resolveAdminDisplayName(payload: Record<string, unknown>): string {
    for (const claimSource of collectClaimSources(payload)) {
        const firstName = readStringClaim(claimSource, "firstName", "first_name", "given_name");
        const lastName = readStringClaim(claimSource, "lastName", "last_name", "family_name");

        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        }

        if (firstName) {
            return firstName;
        }

        const fullName = readStringClaim(claimSource, "fullName", "name", "displayName");

        if (fullName) {
            return fullName;
        }
    }

    return DEFAULT_ADMIN_DISPLAY_NAME;
}

function collectClaimSources(payload: Record<string, unknown>): Record<string, unknown>[] {
    const claimSources = [payload];

    for (const nestedClaimKey of ["admin", "user", "data"]) {
        const nestedClaimValue = payload[nestedClaimKey];

        if (nestedClaimValue && typeof nestedClaimValue === "object") {
            claimSources.push(nestedClaimValue as Record<string, unknown>);
        }
    }

    return claimSources;
}

function readStringClaimFromNestedRecords(
    payload: Record<string, unknown>,
    ...claimKeys: string[]
): string | null {
    for (const claimSource of collectClaimSources(payload)) {
        const claimValue = readStringClaim(claimSource, ...claimKeys);

        if (claimValue) {
            return claimValue;
        }
    }

    return null;
}

/** Builds a readable display name from an email address when name claims are missing. */
function resolveDisplayNameFromEmail(email: string): string {
    const emailLocalPart = email.split("@")[0]?.trim() ?? "";

    if (!emailLocalPart) {
        return DEFAULT_ADMIN_DISPLAY_NAME;
    }

    return emailLocalPart
        .split(/[._-]+/)
        .filter(Boolean)
        .map((namePart) => namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase())
        .join(" ");
}

function readStringClaim(
    payload: Record<string, unknown>,
    ...claimKeys: string[]
): string | null {
    for (const claimKey of claimKeys) {
        const claimValue = payload[claimKey];

        if (typeof claimValue === "string" && claimValue.trim()) {
            return claimValue.trim();
        }
    }

    return null;
}

/** Reads the first role from a `roles` string array claim when present. */
function readFirstRoleClaim(payload: Record<string, unknown>): string | null {
    for (const claimSource of collectClaimSources(payload)) {
        const roles = claimSource.roles;

        if (!Array.isArray(roles)) {
            continue;
        }

        for (const role of roles) {
            if (typeof role === "string" && role.trim()) {
                return role.trim();
            }
        }
    }

    return null;
}

/** Formats backend role names such as `superAdmin` into `SUPER ADMIN`. */
function formatAdminRoleLabel(roleName: string): string {
    return roleName
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .trim()
        .toUpperCase();
}
