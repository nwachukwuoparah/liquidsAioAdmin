import { getProfileAvatarInitials, PROFILE_AVATAR_CLASS } from "@/lib/profile-avatar";

type ProfileAvatarSize = "sm" | "lg" | "xl" | "xxl" | "xxxl" | "xxxxl" | "xxxxxl" | "xxxxxxl" | "xxxxxxxl" | "xxxxxxxxl";

interface ProfileAvatarProps {
    name: string;
    email?: string | null;
    initials?: string;
    imageUrl?: string | null;
    size?: ProfileAvatarSize;
    /** When true, renders a blank avatar shell until client session data is ready. */
    isLoading?: boolean;
};

const PROFILE_AVATAR_SIZE_CLASS: Record<ProfileAvatarSize, string> = {
    sm: "h-9 w-9 text-xs lg:h-8 lg:w-8",
    lg: "h-12 w-12 text-sm",
    xl: "h-15 w-15 text-base",
    xxl: "h-18 w-18 text-lg",
    xxxl: "h-21 w-21 text-xl",
    xxxxl: "h-24 w-24 text-2xl",
    xxxxxl: "h-27 w-27 text-3xl",
    xxxxxxl: "h-30 w-30 text-4xl",
    xxxxxxxl: "h-33 w-33 text-5xl",
    xxxxxxxxl: "h-36 w-36 text-6xl",
};

/** Renders a profile photo when available, otherwise initials on a branded background. */
export function ProfileAvatar({
    name,
    email,
    initials,
    imageUrl = null,
    size = "sm",
    isLoading = false,
}: ProfileAvatarProps) {
    const sizeClass = PROFILE_AVATAR_SIZE_CLASS[size];
    const avatarInitials = initials ?? getProfileAvatarInitials(name, email);

    return (
        <div
            className={`${sizeClass} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold ${PROFILE_AVATAR_CLASS}`}
            aria-hidden={isLoading || undefined}
        >
            {isLoading ? null : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={`${name} profile`} className="h-full w-full object-cover" />
            ) : (
                avatarInitials
            )}
        </div>
    );
}
