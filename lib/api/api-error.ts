/** Structured API error thrown by the HTTP client. */
export class ApiError extends Error {
    readonly statusCode: number;
    readonly fieldKey?: string;

    constructor(message: string, statusCode: number, fieldKey?: string) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.fieldKey = fieldKey;
    }
}

/** Parses a failed API JSON body into an ApiError. */
export function toApiError(statusCode: number, responseBody: unknown): ApiError {
    if (typeof responseBody === "object" && responseBody !== null) {
        const parsedBody = responseBody as {
            message?: string;
            error?: { key?: string; title?: string };
        };

        return new ApiError(
            parsedBody.message ?? "Request failed.",
            statusCode,
            parsedBody.error?.key,
        );
    }

    return new ApiError("Request failed.", statusCode);
}
