/** Admin auth route paths (UI flow). */
export const AUTH_LOGIN_ROUTE = "/login";
export const AUTH_SETUP_2FA_ROUTE = "/setup-2fa";
export const AUTH_VERIFY_ROUTE = "/verify";
export const ADMIN_DASHBOARD_ROUTE = "/overview";

/** Default auth entry — invite sign-up is the first screen in the flow. */
export const AUTH_ENTRY_ROUTE = "/sign-up";

/** Auth routes that should redirect fully authenticated users to the dashboard. */
export const GUEST_ONLY_AUTH_ROUTES = [AUTH_LOGIN_ROUTE] as const;

/** Auth routes allowed while 2FA setup is still pending. */
export const TWO_FACTOR_SETUP_AUTH_ROUTES = [AUTH_SETUP_2FA_ROUTE, AUTH_VERIFY_ROUTE] as const;

/** Admin routes that require a stored access token. */
export const PROTECTED_ADMIN_ROUTE_PREFIXES = [
    "/overview",
    "/compliance",
    "/rfqs",
    "/users",
    "/inventory",
    "/orders",
    "/settings",
] as const;
