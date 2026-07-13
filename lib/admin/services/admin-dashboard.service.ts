import {
    ADMIN_COMPLIANCE_OVERVIEW_PATH,
    ADMIN_INVENTORY_ACTIONS_PATH,
    ADMIN_INVENTORY_OVERVIEW_PATH,
    ADMIN_INVENTORY_STATS_PATH,
    ADMIN_ORDERS_ACTIONS_PATH,
    ADMIN_ORDERS_PATH,
    ADMIN_ORDERS_STATS_PATH,
    ADMIN_OVERVIEW_PATH,
    ADMIN_COMPANY_INFO_PATH,
    ADMIN_PROFILE_ME_PATH,
    ADMIN_PROFILE_ADMINS_PATH,
    ADMIN_SETTINGS_COMPANY_INFO_PATH,
    ADMIN_USERS_PATH,
    ADMIN_USERS_STATS_PATH,
    getAdminUserDetailPath,
} from "@/lib/admin/constants/admin-api.constant";
import type {
    AdminInventoryActionRequestBody,
    AdminOrderActionRequestBody,
    AdminOrderRecord,
    AdminOrderStatRecord,
    AdminSettingsGeneralData,
    AdminSettingsGeneralRequestBody,
    AdminSettingsProfileData,
    AdminSettingsProfileRequestBody,
    AdminUserRecord,
    AdminUserSegmentTab,
    AdminUserStatRecord,
} from "@/lib/admin/types/admin-api.types";
import type { AdminOverviewResponse, AdminComplianceOverviewStats } from "@/lib/admin/constants/admin-overview.constant";
import type { AdminInventoryOverviewStats } from "@/lib/admin/constants/admin-inventory-overview.constant";
import { getInventoryOverviewDefaultRange } from "@/lib/admin/constants/admin-inventory-overview.constant";
import { parseAdminInventoryOverviewResponse } from "@/lib/admin/utilities/parse-admin-inventory-overview-response";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";
import { parseAdminInventoryStatsResponse } from "@/lib/admin/utilities/parse-admin-inventory-stats-response";
import { parseAdminSettingsGeneralResponse } from "@/lib/admin/utilities/parse-admin-settings-general-response";
import { parseAdminSettingsProfileFromUserDetail } from "@/lib/admin/utilities/parse-admin-settings-profile-response";
import { apiClient } from "@/lib/api/api-client";
import {
    parseAdminUsersResponse,
    type AdminUsersPage,
} from "@/lib/users/utilities/parse-admin-users-response";

export async function fetchAdminOrders(filters: { tab?: string; search?: string } = {}) {
    const response = await apiClient.get<AdminOrderRecord[]>(ADMIN_ORDERS_PATH, {
        tab: filters.tab,
        search: filters.search,
    });

    return response.body;
}

export async function fetchAdminOrderStats() {
    const response = await apiClient.get<AdminOrderStatRecord[]>(ADMIN_ORDERS_STATS_PATH);
    return response.body;
}

export async function postAdminOrderAction(requestBody: AdminOrderActionRequestBody) {
    return apiClient.post<{ orderId: string; action: string; processed: boolean }>(
        ADMIN_ORDERS_ACTIONS_PATH,
        requestBody,
    );
}

export async function fetchAdminUsers(
    filters: Record<string, string | undefined> & {
        accountType?: AdminUserSegmentTab;
        search?: string;
        complianceStatus?: string;
        limit?: string | number;
    } = {},
) {
    const response = await apiClient.get<AdminUserRecord[]>(ADMIN_USERS_PATH, filters);
    return response.body;
}

/** Loads a users page with totalCount for tab badges and pagination. */
export async function fetchAdminUsersPage(
    filters: Record<string, string | undefined> & {
        accountType?: AdminUserSegmentTab;
        search?: string;
        complianceStatus?: string;
        limit?: string | number;
    } = {},
): Promise<AdminUsersPage> {
    const response = await apiClient.get<unknown>(ADMIN_USERS_PATH, {
        ...filters,
        limit: filters.limit != null ? String(filters.limit) : undefined,
    });

    return parseAdminUsersResponse(response.body);
}

export async function fetchAdminUserStats() {
    const response = await apiClient.get<{ data: { stats: AdminUserStatRecord } }>(ADMIN_USERS_STATS_PATH);
    return response.body;
}

export async function fetchAdminUserDetails(userId: string) {
    const response = await apiClient.get<{ data: { user: AdminUserRecord } }>(
        getAdminUserDetailPath(userId),
    );
    return response.body;
}

export async function postAdminUserAction({ userId, action, reason }: { userId: string, action: "suspend" | "restore", reason: string }) {
    const response = await apiClient.post<{ message: string }>(`${ADMIN_USERS_PATH}/${userId}/${action}`, { reason });
    return response.body;
};

export async function fetchAdminInventoryStats() {
    const response = await apiClient.get<unknown>(ADMIN_INVENTORY_STATS_PATH);
    return parseAdminInventoryStatsResponse(response.body);
}

export async function fetchAdminInventoryOverview(
    range: { start?: string; end?: string } = getInventoryOverviewDefaultRange(),
): Promise<AdminInventoryOverviewStats> {
    const response = await apiClient.get<unknown>(
        ADMIN_INVENTORY_OVERVIEW_PATH,
        {
            start: range.start,
            end: range.end,
        },
    );

    return parseAdminInventoryOverviewResponse(response.body);
}

export async function postAdminInventoryAction(requestBody: AdminInventoryActionRequestBody) {
    return apiClient.post<{ lotId: string; action: string; processed: boolean }>(
        ADMIN_INVENTORY_ACTIONS_PATH,
        requestBody,
    );
}

export async function fetchAdminComplianceOverview(): Promise<{ overview: AdminComplianceOverviewStats }> {
    const response = await apiClient.get<{ overview: AdminComplianceOverviewStats }>(
        ADMIN_COMPLIANCE_OVERVIEW_PATH,
    );

    return parseAdminApiResponseData<{ overview: AdminComplianceOverviewStats }>(response.body);
}

export async function fetchAdminOverview(period = "This month") {
    const response = await apiClient.get<AdminOverviewResponse>(ADMIN_OVERVIEW_PATH, { period });

    return parseAdminApiResponseData<AdminOverviewResponse>(response.body);
}

/** Fetches the signed-in admin profile via GET /profile/me. */
export async function fetchAdminSettingsProfile(): Promise<AdminSettingsProfileData> {
    const response = await apiClient.get<unknown>(ADMIN_PROFILE_ME_PATH);
    return parseAdminSettingsProfileFromUserDetail(response.body);
}

/** Updates the signed-in admin profile via PATCH /profile/admins. */
export async function patchAdminSettingsProfile(requestBody: AdminSettingsProfileRequestBody) {
    const response = await apiClient.patch<unknown>(ADMIN_PROFILE_ADMINS_PATH, requestBody);

    return {
        data: parseAdminApiResponseData<AdminSettingsProfileData>(response.body),
        message: response.body,
    };
}

export async function fetchAdminSettingsGeneral(): Promise<AdminSettingsGeneralData> {
    const response = await apiClient.get<unknown>(ADMIN_COMPANY_INFO_PATH);
    return parseAdminSettingsGeneralResponse(response.body);
}

export async function postAdminSettingsGeneral(requestBody: AdminSettingsGeneralRequestBody) {
    const response = await apiClient.post<unknown>(ADMIN_SETTINGS_COMPANY_INFO_PATH, requestBody);

    return {
        data: parseAdminSettingsGeneralResponse(response.body),
        message: response.body,
    };
}
