import type {
    AdminComplianceReviewsPage,
    AdminComplianceReviewsResponseBody,
} from "@/lib/compliance/types/admin-compliance-api.types";

function normalizePagePayload(payload: AdminComplianceReviewsResponseBody): AdminComplianceReviewsPage {
    const page = payload.data ?? payload;

    return {
        users: page.users ?? [],
        hasNext: page.hasNext ?? false,
        nextCursor: page.nextCursor ?? null,
    };
}

/** Parses the compliance list API body into a normalized cursor page shape. */
export function parseAdminComplianceApiResponse(
    responseBody: AdminComplianceReviewsResponseBody,
): AdminComplianceReviewsPage {
    if (responseBody.status === "failed") {
        throw new Error(responseBody.message ?? "Failed to fetch compliance reviews.");
    }

    return normalizePagePayload(responseBody);
}
