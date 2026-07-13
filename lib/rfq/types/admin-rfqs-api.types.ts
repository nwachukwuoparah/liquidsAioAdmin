import type { AdminRfqTabStatus } from "@/lib/rfq/constants/admin-rfqs-api.constant";
import { AnyARecord } from "dns";

export interface AdminRfqApiCursor {
    cursor_id?: string;
    cursor_sort_at?: string;
}

export interface AdminRfqCreatorProfile {
    id?: string;
    firstName: string;
    lastName: string;
    profilePicture?: string | undefined;
}

export interface AdminRfqApiRecord {
    id: string;
    status: AdminRfqTabStatus | string;
    createdAt: string;
    resolvedAt: string;
    category: string;
    description?: string;
    requirements?: string;
    minPrice: number;
    maxPrice: number;
    user: AdminRfqCreatorProfile;
}

export interface AdminRfqsAdminApiPage {
    totalCount: number;
    results: AdminRfqApiRecord[];
    rfqs: AdminRfqApiRecord[];
    hasNext: boolean;
    nextCursor?: AdminRfqApiCursor | null;
}

export interface AdminRfqsAdminApiResponseBody {
    status?: string;
    message?: string;
    data?: AdminRfqsAdminApiPage;
    totalCount?: number;
    results?: AdminRfqApiRecord[]; 
    rfqs?: AdminRfqApiRecord[];
    hasNext?: boolean;
    nextCursor?: AdminRfqApiCursor | null;
}

export interface FetchAdminRfqsPageParams {
    status: AdminRfqTabStatus;
    limit?: number;
    order?: "asc" | "desc";
    cursorId?: string;
    cursorSortAt?: string;
    minPrice?: number;
    maxPrice?: number;
}
