import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAdminLogout } from "@/lib/auth/hooks/use-admin-logout";
import { AUTH_LOGIN_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import {
    clearAuthSession,
    getAccessToken,
    setAccessToken,
} from "@/lib/auth/utilities/auth-token-storage";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";

const mockReplaceBrowserHistoryRoute = vi.fn();
const mockAdminLogout = vi.fn();

vi.mock("@/lib/auth/utilities/replace-browser-history-route", () => ({
    replaceBrowserHistoryRoute: (...args: unknown[]) => mockReplaceBrowserHistoryRoute(...args),
}));

vi.mock("@/lib/auth/services/admin-logout.service", () => ({
    adminLogout: (...args: unknown[]) => mockAdminLogout(...args),
}));

function createWrapper(queryClient: QueryClient) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe("useAdminLogout", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        clearAuthSession();
        mockReplaceBrowserHistoryRoute.mockReset();
        mockAdminLogout.mockReset();
    });

    it("clears the session and redirects to login after a successful logout", async () => {
        setAccessToken("access-token");
        mockAdminLogout.mockResolvedValue({ status: "success", message: "Logged out." });

        const queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
            },
        });
        const clearSpy = vi.spyOn(queryClient, "clear");

        const { result } = renderHook(() => useAdminLogout(), {
            wrapper: createWrapper(queryClient),
        });

        result.current.mutate();

        await waitFor(() => {
            expect(mockAdminLogout).toHaveBeenCalled();
            expect(getAccessToken()).toBeNull();
            expect(clearSpy).toHaveBeenCalled();
            expect(mockReplaceBrowserHistoryRoute).toHaveBeenCalledWith(AUTH_LOGIN_ROUTE);
        });
    });

    it("still clears the session and redirects when logout fails", async () => {
        setAccessToken("access-token");
        mockAdminLogout.mockRejectedValue(new Error("Network error"));

        const queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
            },
        });

        const { result } = renderHook(() => useAdminLogout(), {
            wrapper: createWrapper(queryClient),
        });

        result.current.mutate();

        await waitFor(() => {
            expect(getAccessToken()).toBeNull();
            expect(mockReplaceBrowserHistoryRoute).toHaveBeenCalledWith(AUTH_LOGIN_ROUTE);
        });
    });
});
