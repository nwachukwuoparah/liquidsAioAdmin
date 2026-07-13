"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import {
    fetchAdminSettingsGeneral,
    fetchAdminSettingsProfile,
    postAdminSettingsGeneral,
    patchAdminSettingsProfile,
} from "@/lib/admin/services/admin-dashboard.service";
import type {
    AdminSettingsGeneralRequestBody,
    AdminSettingsProfileRequestBody,
} from "@/lib/admin/types/admin-api.types";
import { getAdminApiResponseMessage } from "@/lib/admin/utilities/parse-admin-api-response-data";
import { QueryConfig } from "@/lib/query/query-config";

/** Loads profile settings for the signed-in admin via GET /profile/me. */
export function useAdminSettingsProfile() {
    return useQuery({
        queryKey: ["admin-settings-profile"],
        queryFn: fetchAdminSettingsProfile,
        ...QueryConfig.DEFAULT,
    });
}

/** Saves profile settings via PATCH /profile/admins. */
export function useAdminSettingsProfileSave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-settings-profile-save"],
        mutationFn: (requestBody: AdminSettingsProfileRequestBody) => patchAdminSettingsProfile(requestBody),
        retry: 0,
        onSuccess: (response) => {
            toast.success(getAdminApiResponseMessage(response.message, "Profile updated."));
            void queryClient.invalidateQueries({ queryKey: ["admin-settings-profile"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}

/** Loads general platform settings. */
export function useAdminSettingsGeneral() {
    return useQuery({
        queryKey: ["admin-settings-general"],
        queryFn: fetchAdminSettingsGeneral,
        ...QueryConfig.DEFAULT,
    });
}

/** Saves general platform settings via POST. */
export function useAdminSettingsGeneralSave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-settings-general-save"],
        mutationFn: (requestBody: AdminSettingsGeneralRequestBody) => postAdminSettingsGeneral(requestBody),
        retry: 0,
        onSuccess: (response) => {
            toast.success(getAdminApiResponseMessage(response.message, "Company info saved."));
            void queryClient.invalidateQueries({ queryKey: ["admin-settings-general"] });
        },
        onError: (error: Error) => {
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        },
    });
}
