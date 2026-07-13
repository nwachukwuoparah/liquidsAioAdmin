import {
    ADMIN_COMPLIANCE_ACTIONS_PATH,
    ADMIN_COMPLIANCE_REVIEWS_PATH,
    ADMIN_COMPLIANCE_REVIEW_PATH,
    getAdminComplianceAssignPath,
    getAdminComplianceClaimPath,
    getAdminComplianceDetailPath,
    getAdminComplianceUnclaimPath,
} from "@/lib/admin/constants/admin-api.constant";
import { ADMIN_COMPLIANCE_DEFAULT_PAGE_LIMIT } from "@/lib/compliance/constants/admin-compliance-api.constant";
import type {
    AdminComplianceAssignRequestBody,
    AdminComplianceDetailRecord,
    AdminComplianceDetailResponseBody,
} from "@/lib/compliance/types/admin-compliance-detail.types";
import type {
    AdminComplianceReviewsPage,
    AdminComplianceReviewsResponseBody,
    FetchAdminComplianceReviewsPageParams,
} from "@/lib/compliance/types/admin-compliance-api.types";
import { parseAdminComplianceDetailResponse } from "@/lib/compliance/utilities/parse-admin-compliance-detail-response";
import { mapAdminComplianceApiRecord } from "@/lib/compliance/utilities/map-admin-compliance-api-record";
import { parseAdminComplianceApiResponse } from "@/lib/compliance/utilities/parse-admin-compliance-api-response";
import type { AdminComplianceReviewRecord } from "@/lib/admin/types/admin-api.types";
import type { AdminComplianceActionRequestBody } from "@/lib/admin/types/admin-api.types";
import type { ComplianceReviewMutationVariables } from "@/lib/compliance/types/admin-compliance-review.types";
import { getAdminApiResponseMessage } from "@/lib/admin/utilities/parse-admin-api-response-data";
import { apiClient } from "@/lib/api/api-client";

function buildAdminComplianceQueryParams({
    limit = ADMIN_COMPLIANCE_DEFAULT_PAGE_LIMIT,
    cursor_id,
    cursor_sort_at,
    ...filters
}: FetchAdminComplianceReviewsPageParams): Record<string, string | undefined> {
    return {
        ...filters,
        limit: String(limit),
        cursor_id,
        cursor_sort_at,
    };
}

export interface AdminComplianceReviewsMappedPage {
    results: AdminComplianceReviewRecord[];
    hasNext: boolean;
    nextCursor?: { cursor_id?: string; cursor_sort_at?: string } | null;
}

/** Fetches a cursor-paginated compliance review page. */
export async function fetchAdminComplianceReviewsPage(
    params: FetchAdminComplianceReviewsPageParams = {},
): Promise<AdminComplianceReviewsMappedPage> {
    const { body } = await apiClient.get<AdminComplianceReviewsResponseBody>(
        ADMIN_COMPLIANCE_REVIEWS_PATH,
        buildAdminComplianceQueryParams(params),
    );

    const page = parseAdminComplianceApiResponse(body);

    return {
        results: page.results.map((record, index) => mapAdminComplianceApiRecord(record, index)),
        hasNext: page.hasNext,
        nextCursor: page.nextCursor,
    };
}

/** Fetches a single compliance user detail with uploaded documents. */
export async function fetchAdminComplianceDetail(userId: string): Promise<AdminComplianceDetailRecord> {
    const { body } = await apiClient.get<AdminComplianceDetailResponseBody>(
        getAdminComplianceDetailPath(userId),
    );

    return parseAdminComplianceDetailResponse(body);
}

/** Accepts a compliance document or full review. */
export async function postAdminComplianceReviewAccept({ payload }: ComplianceReviewMutationVariables) {
    const response = await apiClient.post<unknown>(ADMIN_COMPLIANCE_REVIEW_PATH, payload);

    return {
        message: getAdminApiResponseMessage(response.body, "Compliance review accepted."),
    };
}

/** Rejects a compliance document or full review. */
export async function postAdminComplianceReviewReject({ payload }: ComplianceReviewMutationVariables) {
    const response = await apiClient.post<unknown>(ADMIN_COMPLIANCE_REVIEW_PATH, payload);

    return {
        message: getAdminApiResponseMessage(response.body, "Compliance review rejected."),
    };
}

/** Runs a legacy request-update action on a review. */
export async function postAdminComplianceActionRequest(requestBody: AdminComplianceActionRequestBody) {
    return apiClient.post<{ reviewId: string; action: string; processed: boolean }>(
        ADMIN_COMPLIANCE_ACTIONS_PATH,
        requestBody,
    );
}

/** Updates the reviewer assigned to a compliance review. */
export async function postAdminComplianceAssignee(
    reviewId: string,
    requestBody: AdminComplianceAssignRequestBody,
) {
    return apiClient.post<{ reviewId: string; assignedTo: string }>(
        getAdminComplianceAssignPath(reviewId),
        requestBody,
    );
}

/** Claims a compliance case for the signed-in admin. */
export async function postAdminComplianceClaim(userId: string) {
    const response = await apiClient.post<unknown>(getAdminComplianceClaimPath(userId));

    return {
        message: getAdminApiResponseMessage(response.body, "Compliance case claimed."),
    };
}

/** Releases a previously claimed compliance case. */
export async function postAdminComplianceUnclaim(userId: string) {
    const response = await apiClient.post<unknown>(getAdminComplianceUnclaimPath(userId));

    return {
        message: getAdminApiResponseMessage(response.body, "Compliance case released."),
    };
}
