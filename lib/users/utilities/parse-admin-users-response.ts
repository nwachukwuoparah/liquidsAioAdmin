import type { AdminUserRecord } from "@/lib/admin/types/admin-api.types";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";

export interface AdminUsersPage {
    users: AdminUserRecord[];
    totalCount: number;
}

type NormalizedUsersPayload = {
    users?: AdminUserRecord[];
    results?: AdminUserRecord[];
    count?: number;
    total?: number;
    totalCount?: number;
    total_count?: number;
};

function toCount(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function normalizeUsersPayload(payload: NormalizedUsersPayload | AdminUserRecord[]): {
    users: AdminUserRecord[];
    totalCount?: number;
} {
    if (Array.isArray(payload)) {
        return {
            users: payload,
            totalCount: payload.length,
        };
    }

    const users = Array.isArray(payload.users)
        ? payload.users
        : Array.isArray(payload.results)
          ? payload.results
          : [];

    const totalCount =
        toCount(payload.totalCount)
        ?? toCount(payload.total_count)
        ?? toCount(payload.total)
        ?? toCount(payload.count)
        ?? users.length;

    return { users, totalCount };
}

/** Parses GET /users list responses into a normalized page shape. */
export function parseAdminUsersResponse(responseBody: unknown): AdminUsersPage {
    if (
        responseBody &&
        typeof responseBody === "object" &&
        "status" in responseBody &&
        (responseBody as { status?: string }).status === "failed"
    ) {
        throw new Error(
            (responseBody as { message?: string }).message ?? "Failed to fetch users.",
        );
    }

    const payload = parseAdminApiResponseData<NormalizedUsersPayload | AdminUserRecord[]>(
        responseBody,
    );
    const { users, totalCount = users.length } = normalizeUsersPayload(payload);

    return {
        users,
        totalCount,
    };
}
