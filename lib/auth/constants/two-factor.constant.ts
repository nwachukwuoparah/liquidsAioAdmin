/** Demo TOTP secret for manual entry during UI development. */
export const DEMO_TWO_FACTOR_SECRET = "LQUIDSAIOADMIN2FASECRET";

/** Issuer name embedded in authenticator app entries. */
export const TWO_FACTOR_ISSUER_NAME = "LiquidsAIO Admin";

/** QR code image size in pixels. */
export const TWO_FACTOR_QR_CODE_SIZE_PX = 200;

/** Interval for refreshing 2FA setup QR data from the API. 60000 = 1 minute */
export const TWO_FACTOR_SETUP_QR_POLL_INTERVAL_MS = 60000;

/** Access token status indicating the admin must complete 2FA setup. */
export const ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA = "pending_2fa";

/** Number of digits in the two-factor authentication code. */
export const AUTH_OTP_LENGTH = 6;
