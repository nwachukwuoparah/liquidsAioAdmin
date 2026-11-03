import {
    ADMIN_COMPLIANCE_ACTIONS_PATH,
    ADMIN_COMPLIANCE_AUDIT_LOGS_PATH,
    ADMIN_COMPLIANCE_REVIEWS_PATH,
    ADMIN_COMPLIANCE_REVIEW_PATH,
    ADMIN_COMPLIANCE_VIEWING_LINK_PATH,
    getAdminComplianceAssignPath,
    getAdminComplianceClaimPath,
    getAdminComplianceDetailPath,
    getAdminComplianceUnclaimPath,
} from "@/lib/admin/constants/admin-api.constant";
import { ADMIN_COMPLIANCE_DEFAULT_PAGE_LIMIT } from "@/lib/compliance/constants/admin-compliance-api.constant";
import { ADMIN_COMPLIANCE_AUDIT_DEFAULT_PAGE_LIMIT } from "@/lib/compliance/constants/admin-compliance-audit.constant";
import type {
    AdminComplianceAssignRequestBody,
    AdminComplianceDetailData,
    AdminComplianceDetailResponseBody,
} from "@/lib/compliance/types/admin-compliance-detail.types";
import type {
    AdminComplianceReviewsResponseBody,
    FetchAdminComplianceReviewsPageParams,
} from "@/lib/compliance/types/admin-compliance-api.types";
import type {
    AdminComplianceAuditLogApiRecord,
    AdminComplianceAuditLogRecord,
    AdminComplianceAuditLogsResponseBody,
    FetchAdminComplianceAuditLogsPageParams,
} from "@/lib/compliance/types/admin-compliance-audit.types";
import { parseAdminComplianceDetailResponse } from "@/lib/compliance/utilities/parse-admin-compliance-detail-response";
import { mapAdminComplianceApiRecord } from "@/lib/compliance/utilities/map-admin-compliance-api-record";
import { mapAdminComplianceAuditLogRecord } from "@/lib/compliance/utilities/map-admin-compliance-audit-record";
import { parseAdminComplianceApiResponse } from "@/lib/compliance/utilities/parse-admin-compliance-api-response";
import { parseAdminComplianceAuditLogsResponse } from "@/lib/compliance/utilities/parse-admin-compliance-audit-response";
import type { AdminComplianceReviewRecord } from "@/lib/admin/types/admin-api.types";
import type { AdminComplianceActionRequestBody } from "@/lib/admin/types/admin-api.types";
import type { ComplianceReviewMutationVariables } from "@/lib/compliance/types/admin-compliance-review.types";
import { getAdminApiResponseMessage } from "@/lib/admin/utilities/parse-admin-api-response-data";
import { ApiError } from "@/lib/api/api-error";
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

export interface AdminComplianceAuditLogsMappedPage {
    results: AdminComplianceAuditLogRecord[];
    auditLogs: AdminComplianceAuditLogApiRecord[];
    hasNext: boolean;
    nextCursor?: { cursor_id?: string; cursor_sort_at?: string } | null;
}

function buildAdminComplianceAuditQueryParams({
    limit = ADMIN_COMPLIANCE_AUDIT_DEFAULT_PAGE_LIMIT,
    cursor_id,
    cursor_sort_at,
    ...filters
}: FetchAdminComplianceAuditLogsPageParams): Record<string, string | undefined> {
    return {
        ...filters,
        limit: String(limit),
        cursor_id,
        cursor_sort_at,
    };
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
        results: page.users.map((record, index) => mapAdminComplianceApiRecord(record, index)),
        hasNext: page.hasNext,
        nextCursor: page.nextCursor,
    };
}

/** Fetches a cursor-paginated compliance audit trail page. */
export async function fetchAdminComplianceAuditLogsPage(
    params: FetchAdminComplianceAuditLogsPageParams = {},
): Promise<AdminComplianceAuditLogsMappedPage> {
    const { body } = await apiClient.get<AdminComplianceAuditLogsResponseBody>(
        ADMIN_COMPLIANCE_AUDIT_LOGS_PATH,
        buildAdminComplianceAuditQueryParams(params),
    );

    const page = parseAdminComplianceAuditLogsResponse(body);

    return {
        results: page.auditLogs.map((record, index) => mapAdminComplianceAuditLogRecord(record, index)),
        auditLogs: page.auditLogs,
        hasNext: page.hasNext,
        nextCursor: page.nextCursor,
    };
}

/** Fetches a single compliance user detail with exact server payload structure. */
export async function fetchAdminComplianceDetail(userId: string): Promise<AdminComplianceDetailData> {
    const { body } = await apiClient.get<AdminComplianceDetailResponseBody>(
        getAdminComplianceDetailPath(userId),
    );

    return parseAdminComplianceDetailResponse(body);
}

/** Accepts a compliance document or full review. */
export async function postAdminComplianceReviewAccept({ userId, payload }: ComplianceReviewMutationVariables) {
    try {
        const response = await apiClient.post<unknown>(ADMIN_COMPLIANCE_REVIEW_PATH, payload);

        return {
            message: getAdminApiResponseMessage(response.body, "Compliance review accepted."),
        };
    } catch (error) {
        if (
            userId &&
            error instanceof ApiError &&
            (error.message.toLowerCase().includes("claim") || error.statusCode === 400 || error.statusCode === 403)
        ) {
            try {
                await postAdminComplianceClaim(userId);
                const retryResponse = await apiClient.post<unknown>(ADMIN_COMPLIANCE_REVIEW_PATH, payload);
                return {
                    message: getAdminApiResponseMessage(retryResponse.body, "Compliance review accepted."),
                };
            } catch {
                throw error;
            }
        }
        throw error;
    }
}

/** Rejects a compliance document or full review. */
export async function postAdminComplianceReviewReject({ userId, payload }: ComplianceReviewMutationVariables) {
    try {
        const response = await apiClient.post<unknown>(ADMIN_COMPLIANCE_REVIEW_PATH, payload);

        return {
            message: getAdminApiResponseMessage(response.body, "Compliance review rejected."),
        };
    } catch (error) {
        if (
            userId &&
            error instanceof ApiError &&
            (error.message.toLowerCase().includes("claim") || error.statusCode === 400 || error.statusCode === 403)
        ) {
            try {
                await postAdminComplianceClaim(userId);
                const retryResponse = await apiClient.post<unknown>(ADMIN_COMPLIANCE_REVIEW_PATH, payload);
                return {
                    message: getAdminApiResponseMessage(retryResponse.body, "Compliance review rejected."),
                };
            } catch {
                throw error;
            }
        }
        throw error;
    }
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

export interface FetchAdminComplianceViewingLinkParams {
    file_id: string;
    format?: string | null;
    type: "kyc" | "kyb";
}

export interface AdminComplianceViewingLinkResponseBody {
    status?: string;
    message?: string;
    data?: {
        viewingLink: string;
    };
}

/** Generates a secure, signed time-limited viewing link for a KYC or KYB document. */
export async function fetchAdminComplianceDocumentViewingLink(
    params: FetchAdminComplianceViewingLinkParams,
): Promise<{ viewingLink: string }> {
    const queryParams: Record<string, string> = {
        file_id: params.file_id,
        type: params.type,
    };

    if (params.format?.trim()) {
        queryParams.format = params.format.trim().toLowerCase();
    }

    const { body } = await apiClient.get<AdminComplianceViewingLinkResponseBody>(
        ADMIN_COMPLIANCE_VIEWING_LINK_PATH,
        queryParams,
    );

    if (body.status === "failed") {
        throw new Error(body.message ?? "Failed to generate document viewing link.");
    }

    const viewingLink =
        body.data?.viewingLink ??
        (body as any)?.viewingLink ??
        (typeof body.data === "string" ? body.data : undefined);

    if (!viewingLink) {
        throw new Error(body.message ?? "No viewing link returned by server.");
    }

    return { viewingLink };
}
