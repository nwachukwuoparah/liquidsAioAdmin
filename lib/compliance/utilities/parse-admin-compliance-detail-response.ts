import type {
    AdminComplianceDetailRecord,
    AdminComplianceDetailResponseBody,
} from "@/lib/compliance/types/admin-compliance-detail.types";
import { mapAdminComplianceDetailApiRecord } from "@/lib/compliance/utilities/map-admin-compliance-detail-api-record";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";
import type { AdminComplianceDetailApiPayload } from "@/lib/compliance/utilities/map-admin-compliance-detail-api-record";

/** Parses the compliance detail API body into a normalized record. */
export function parseAdminComplianceDetailResponse(
    responseBody: AdminComplianceDetailResponseBody,
): AdminComplianceDetailRecord {
    if (responseBody.status === "failed") {
        throw new Error(responseBody.message ?? "Failed to fetch compliance details.");
    }

    const payload = parseAdminApiResponseData<AdminComplianceDetailApiPayload>(responseBody);

    return mapAdminComplianceDetailApiRecord(payload);
}
