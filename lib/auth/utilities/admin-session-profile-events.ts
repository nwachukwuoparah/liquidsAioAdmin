/** Browser event name dispatched when the stored access token changes. */
export const ADMIN_SESSION_PROFILE_CHANGED_EVENT = "laio:admin-session-profile-changed";

/** Notifies listeners that the session access token (and derived profile) may have changed. */
export function notifyAdminSessionProfileChanged(): void {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new Event(ADMIN_SESSION_PROFILE_CHANGED_EVENT));
}
