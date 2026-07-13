/** Thrown when admin access token refresh fails for any reason. */
export class AdminAccessTokenRefreshError extends Error {
    /** True when the refresh session is no longer valid (401/403). */
    readonly isSessionExpired: boolean;

    constructor(message = "Unable to refresh admin access token.", isSessionExpired = false) {
        super(message);
        this.name = "AdminAccessTokenRefreshError";
        this.isSessionExpired = isSessionExpired;
    }
}
