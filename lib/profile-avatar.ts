export function getInitialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Resolves a display name from profile fields, falling back to email. */
export function getProfileDisplayName(
    firstName?: string | null,
    lastName?: string | null,
    email?: string | null,
): string {
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    if (fullName) {
        return fullName;
    }

    return email?.trim() || "User";
}

/** Returns avatar initials from a name, or the first letter of email when no name is available. */
export function getProfileAvatarInitials(name: string, email?: string | null): string {
    if (name.trim()) {
        return getInitialsFromName(name);
    }

    const trimmedEmail = email?.trim();

    if (trimmedEmail) {
        return trimmedEmail.charAt(0).toUpperCase();
    }

    return "?";
}

export const PROFILE_AVATAR_CLASS = "bg-gradient-to-br from-[#7A9960] to-[#465C34] text-white";
