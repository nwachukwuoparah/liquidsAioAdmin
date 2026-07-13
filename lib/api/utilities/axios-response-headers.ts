import type { AxiosResponse } from "axios";

/**
 * Reads a response header from an Axios response, trying common header casings.
 * @param axiosResponse - Axios response returned by the API client.
 * @param headerName - Header name to read.
 */
export function getAxiosResponseHeader(
    axiosResponse: AxiosResponse,
    headerName: string,
): string | null {
    const responseHeaders = axiosResponse.headers;

    if (!responseHeaders) {
        return null;
    }

    if (typeof responseHeaders.get === "function") {
        const headerValue =
            responseHeaders.get(headerName) ?? responseHeaders.get(headerName.toLowerCase());

        return headerValue ? String(headerValue) : null;
    }

    const headerRecord = responseHeaders as Record<string, unknown>;
    const lowerHeaderName = headerName.toLowerCase();
    const rawHeaderValue =
        headerRecord[headerName] ??
        headerRecord[lowerHeaderName] ??
        headerRecord[headerName.toUpperCase()];

    if (Array.isArray(rawHeaderValue)) {
        return rawHeaderValue[0] ? String(rawHeaderValue[0]) : null;
    }

    if (rawHeaderValue !== undefined && rawHeaderValue !== null) {
        return String(rawHeaderValue);
    }

    return null;
}
