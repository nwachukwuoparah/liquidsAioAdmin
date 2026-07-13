import type {
    AdminRfqsAdminApiPage,
    AdminRfqsAdminApiResponseBody,
} from "@/lib/rfq/types/admin-rfqs-api.types";

function normalizePagePayload(payload: AdminRfqsAdminApiResponseBody): AdminRfqsAdminApiPage {
    const page = payload.data ?? payload;

    return {
        totalCount: page.totalCount ?? 0,
        results: page.results ?? [],
        rfqs: page.rfqs ?? [],
        hasNext: page.hasNext ?? false,
        nextCursor: page.nextCursor ?? null,
    };
}

/** Parses the admin RFQ list API body into a normalized page shape. */
export function parseAdminRfqsAdminApiResponse(
    responseBody: AdminRfqsAdminApiResponseBody,
): AdminRfqsAdminApiPage {
    if (responseBody.status === "failed") {
        throw new Error(responseBody.message ?? "Failed to fetch buyer RFQs.");
    }
    return normalizePagePayload(responseBody);
}
