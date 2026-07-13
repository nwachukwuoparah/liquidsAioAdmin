"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AUTH_LOGIN_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import { adminLogout } from "@/lib/auth/services/admin-logout.service";
import { clearAuthSession } from "@/lib/auth/utilities/auth-token-storage";
import { replaceBrowserHistoryRoute } from "@/lib/auth/utilities/replace-browser-history-route";

/** Ends the admin session on the server, then clears local auth and returns to login. */
export function useAdminLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["admin-logout"],
        mutationFn: adminLogout,
        retry: 0,
        onSettled: () => {
            clearAuthSession();
            queryClient.clear();
            replaceBrowserHistoryRoute(AUTH_LOGIN_ROUTE);
        },
    });
}
