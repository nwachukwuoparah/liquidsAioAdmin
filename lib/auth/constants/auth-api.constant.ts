/** Admin login endpoint path. */
export const ADMIN_AUTH_LOGIN_PATH = "/auth/admin/login";

/** Admin signup endpoint path (invite completion). */
export const ADMIN_AUTH_SIGNUP_PATH = "/auth/admin/signup";

/** Admin authenticator app setup endpoint path. */
export const ADMIN_AUTH_AUTHENTICATOR_APP_SETUP_PATH = "/auth/admin/authenticator-app/setup";

/** Admin authenticator app verify endpoint path. */
export const ADMIN_AUTH_AUTHENTICATOR_APP_VERIFY_PATH = "/auth/admin/authenticator-app/verify";

/** Admin verify 2FA code endpoint path. */
export const ADMIN_AUTH_VERIFY_2FA_CODE_PATH = "/auth/admin/verify-2fa-code";

/** Admin access token refresh endpoint path. */
export const ADMIN_AUTH_REFRESH_PATH = "/auth/admin/refresh";

/** Admin logout endpoint path. */
export const ADMIN_AUTH_LOGOUT_PATH = "/auth/admin/logout";

/** Refresh access token when JWT exp is within this many seconds. 180 = 3 minutes */
export const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 180;

/** Auth paths where a 401 response must not clear the stored session. */
export const AUTH_PATHS_WITHOUT_SESSION_CLEAR = [
    ADMIN_AUTH_LOGIN_PATH,
    ADMIN_AUTH_SIGNUP_PATH,
    ADMIN_AUTH_AUTHENTICATOR_APP_SETUP_PATH,
    ADMIN_AUTH_AUTHENTICATOR_APP_VERIFY_PATH,
    ADMIN_AUTH_VERIFY_2FA_CODE_PATH,
    ADMIN_AUTH_LOGOUT_PATH,
] as const;

/** Auth paths where laioat may be cached after a successful response. */
export const AUTH_PATHS_WITH_TOKEN_CACHE = [
    ADMIN_AUTH_VERIFY_2FA_CODE_PATH,
    "/profile/picture",
] as const;

/** Auth paths that must not send credentials or persist tokens before 2FA verify completes. */
export const PRE_VERIFY_AUTH_PATHS = [
    ADMIN_AUTH_LOGIN_PATH,
    ADMIN_AUTH_SIGNUP_PATH,
    ADMIN_AUTH_AUTHENTICATOR_APP_SETUP_PATH,
    ADMIN_AUTH_AUTHENTICATOR_APP_VERIFY_PATH,
] as const;

/** Auth paths that must not attach the session cookie token as a Bearer token. */
export const AUTH_PATHS_WITHOUT_SESSION_BEARER = [
    ...PRE_VERIFY_AUTH_PATHS,
    ADMIN_AUTH_REFRESH_PATH,
] as const;

/** Header name for the access token in API requests and responses. */
export const ACCESS_TOKEN_HEADER = "laioat";

/** Legacy access token cookie names kept for session migration. */
export const LEGACY_ACCESS_TOKEN_STORAGE_KEYS = ["laioat", "x_laiort"] as const;

/** Cookie name for the client-persisted access token copied from backend laioat responses. */
export const ACCESS_TOKEN_STORAGE_KEY = "x-laioat";

/** Response header for refresh token expiry date returned after auth. */
export const REFRESH_TOKEN_EXPIRY_HEADER = "x-laiort-expiry-date";

/** localStorage key for the persisted refresh token expiry date. */
export const REFRESH_TOKEN_EXPIRY_STORAGE_KEY = "x_laiort_expiry_date";

/** Cookie name mirroring the refresh expiry response header for client persistence. */
export const REFRESH_TOKEN_EXPIRY_COOKIE_KEY = "x-laiort-expiry-date";

/** Refresh expiry cookie lifetime in seconds. 315360000 = 10 years */
export const REFRESH_TOKEN_EXPIRY_COOKIE_MAX_AGE_SECONDS = 315360000;

/** sessionStorage flag set after verify until the deferred console log runs. */
export const REFRESH_TOKEN_EXPIRY_LOG_PENDING_SESSION_KEY = "x_laiort_expiry_log_pending";

/** sessionStorage value holding the captured refresh expiry or a missing marker. */
export const REFRESH_TOKEN_EXPIRY_CAPTURED_VALUE_SESSION_KEY = "x_laiort_expiry_captured_value";

/** Marker stored when the refresh expiry response header is absent. */
export const REFRESH_TOKEN_EXPIRY_MISSING_MARKER = "missing";

/** Backend cookies that are only needed during invite sign-up and should not persist afterward. */
export const EPHEMERAL_AUTH_FLOW_COOKIE_KEYS = ["x_lai_last_path"] as const;

/** Request header for invite tokens during signup. */
export const SETUP_TOKEN_REQUEST_HEADER = "token";

/** HTTP Authorization header name. */
export const AUTHORIZATION_HEADER = "Authorization";

/** Bearer token prefix used in the Authorization header. */
export const BEARER_TOKEN_PREFIX = "Bearer";

/** Minimum password length for admin login. */
export const ADMIN_LOGIN_MIN_PASSWORD_LENGTH = 8;

/** Cookie name for the persisted device identifier. Same key as the backend. */
export const DEVICE_ID_STORAGE_KEY = "liquids_aio_admin_device_id";

/** Access token cookie lifetime in seconds. 3600 = 1 hour */
export const ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS = 3600;

/** Device ID cookie lifetime in seconds. 31536000 = 1 year */
export const DEVICE_ID_COOKIE_MAX_AGE_SECONDS = 31536000;

/** Default cookie path for auth session values. */
export const AUTH_COOKIE_PATH = "/";

/** SameSite policy applied to auth cookies. */
export const AUTH_COOKIE_SAME_SITE_POLICY = "Lax";
