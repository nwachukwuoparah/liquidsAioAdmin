import type {
    AdminComplianceDetailData,
    AdminComplianceDetailResponseBody,
} from "@/lib/compliance/types/admin-compliance-detail.types";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";

/** Parses the compliance detail API body and returns the exact server data structure. */
export function parseAdminComplianceDetailResponse(
    responseBody: AdminComplianceDetailResponseBody,
): AdminComplianceDetailData {
    if (responseBody?.status === "failed") {
        throw new Error(responseBody.message ?? "Failed to fetch compliance details.");
    }

    return parseAdminApiResponseData<AdminComplianceDetailData>(responseBody);
}
