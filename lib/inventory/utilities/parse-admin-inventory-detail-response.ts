import type { AdminInventoryLotDetailApiRecord } from "@/lib/inventory/types/admin-inventory-detail.types";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";

/** Parses the lot detail API body into a raw lot record. */
export function parseAdminInventoryDetailResponse(body: unknown): AdminInventoryLotDetailApiRecord {
    const payload = parseAdminApiResponseData<
        AdminInventoryLotDetailApiRecord | { lot?: AdminInventoryLotDetailApiRecord }
    >(body);

    if ("lot" in payload && payload.lot) {
        return payload.lot;
    }

    return payload as AdminInventoryLotDetailApiRecord;
}
