import type {
    AdminComplianceAuditLogsPage,
    AdminComplianceAuditLogsResponseBody,
} from "@/lib/compliance/types/admin-compliance-audit.types";

function resolveAuditLogs(
    payload: AdminComplianceAuditLogsResponseBody["data"] | AdminComplianceAuditLogsResponseBody,
) {
    if (!payload) {
        return [];
    }

    if (payload.auditLogs?.length) {
        return payload.auditLogs;
    }

    if (payload.results?.length) {
        return payload.results;
    }

    return [];
}

function normalizePagePayload(
    payload: AdminComplianceAuditLogsResponseBody,
): AdminComplianceAuditLogsPage {
    const page = payload.data ?? payload;

    return {
        auditLogs: resolveAuditLogs(page),
        hasNext: page.hasNext ?? false,
        nextCursor: page.nextCursor ?? null,
    };
}

/** Parses the audit-logs API body into the full cursor page shape. */
export function parseAdminComplianceAuditLogsResponse(
    responseBody: AdminComplianceAuditLogsResponseBody,
): AdminComplianceAuditLogsPage {
    if (responseBody.status === "failed") {
        throw new Error(responseBody.message ?? "Failed to fetch compliance audit logs.");
    }

    return normalizePagePayload(responseBody);
}
