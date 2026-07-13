import type { AdminApiSuccessResponse } from "@/lib/admin/types/admin-api.types";

/** Unwraps `{ status, data }` admin API payloads to the inner `data` object. */
export function parseAdminApiResponseData<TData>(body: unknown): TData {
    if (
        typeof body === "object" &&
        body !== null &&
        "data" in body &&
        (body as AdminApiSuccessResponse<TData>).data !== undefined
    ) {
        return (body as AdminApiSuccessResponse<TData>).data;
    }

    return body as TData;
}

/** Reads a success message from an admin API body when present. */
export function getAdminApiResponseMessage(body: unknown, fallback: string): string {
    if (
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof (body as { message?: unknown }).message === "string"
    ) {
        return (body as { message: string }).message;
    }

    return fallback;
}
