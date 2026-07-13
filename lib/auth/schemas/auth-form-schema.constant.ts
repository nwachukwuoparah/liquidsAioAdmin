/** Supported auth form schema identifiers. */
export const AUTH_FORM_SCHEMA = {
    LOGIN: "LOGIN",
    SIGN_UP: "SIGN_UP",
    VERIFY_2FA: "VERIFY_2FA",
} as const;

export type AuthFormSchemaName = (typeof AUTH_FORM_SCHEMA)[keyof typeof AUTH_FORM_SCHEMA];
