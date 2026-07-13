/** Resolves the admin API base URL from NEXT_PUBLIC_API_BASE_URL. */
export function getAdminApiBaseUrl(): string | undefined {
    const configuredAdminApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (configuredAdminApiBaseUrl) {
        return configuredAdminApiBaseUrl.replace(/\/$/, "");
    }

    return undefined;
}
