/** Query param used to carry the access token between auth screens. */
export const AUTH_FLOW_TOKEN_QUERY_PARAM = "token";

/**
 * Builds an auth flow URL with the access token query param.
 * @param routePath - Target auth route path.
 * @param accessToken - Access token from response headers.
 */
export function buildAuthFlowUrl(routePath: string, accessToken: string | null): string {
    if (!accessToken) {
        return routePath;
    }

    const searchParams = new URLSearchParams();
    searchParams.set(AUTH_FLOW_TOKEN_QUERY_PARAM, accessToken);

    return `${routePath}?${searchParams.toString()}`;
}

/** Reads the access token from auth flow search params. */
export function readAccessTokenFromAuthFlowSearchParams(
    searchParams: URLSearchParams,
): string | null {
    return searchParams.get(AUTH_FLOW_TOKEN_QUERY_PARAM);
}
