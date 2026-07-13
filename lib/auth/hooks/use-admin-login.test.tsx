import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAdminLogin } from "@/lib/auth/hooks/use-admin-login";
import { ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA } from "@/lib/auth/constants/two-factor.constant";
import { encodeSetupAuthFlowPayload } from "@/lib/auth/utilities/auth-flow-payload";
import { getAccessToken } from "@/lib/auth/utilities/auth-token-storage";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";

const mockReplaceBrowserHistoryRoute = vi.fn();
const mockAdminLogin = vi.fn();

vi.mock("@/lib/auth/utilities/replace-browser-history-route", () => ({
    replaceBrowserHistoryRoute: (...args: unknown[]) => mockReplaceBrowserHistoryRoute(...args),
}));

vi.mock("@/lib/auth/services/admin-login.service", () => ({
    adminLogin: (...args: unknown[]) => mockAdminLogin(...args),
}));

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe("useAdminLogin", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        mockReplaceBrowserHistoryRoute.mockReset();
        mockAdminLogin.mockReset();
    });

    it("routes pending_2fa tokens to setup 2FA", async () => {
        const accessToken = buildTestJwt({
            status: ADMIN_ACCESS_TOKEN_STATUS_PENDING_2FA,
        });
        const loginData = { requiresTwoFactorSetup: true };
        const encodedAuthFlowPayload = encodeSetupAuthFlowPayload({
            setupToken: "setup-token",
            data: loginData,
        });

        mockAdminLogin.mockResolvedValue({
            setupToken: "setup-token",
            token: accessToken,
            body: { status: "success", message: "Welcome back.", data: loginData },
        });

        const { result } = renderHook(() => useAdminLogin(), { wrapper: createWrapper() });

        result.current.mutate({
            email: "admin@liquidsaio.com",
            password: "password123",
        });

        await waitFor(() => {
            expect(mockReplaceBrowserHistoryRoute).toHaveBeenCalledWith(
                `/setup-2fa?token=${encodeURIComponent(encodedAuthFlowPayload)}`,
            );
        });
    });

    it("routes non-pending tokens to verify 2FA", async () => {
        const accessToken = buildTestJwt({
            status: "active",
        });
        const loginData = { requiresTwoFactorSetup: false };

        mockAdminLogin.mockResolvedValue({
            setupToken: null,
            token: accessToken,
            body: { status: "success", message: "Welcome back.", data: loginData },
        });

        const { result } = renderHook(() => useAdminLogin(), { wrapper: createWrapper() });

        result.current.mutate({
            email: "admin@liquidsaio.com",
            password: "password123",
        });

        await waitFor(() => {
            expect(mockReplaceBrowserHistoryRoute).toHaveBeenCalledWith("/verify");
            expect(getAccessToken()).toBe(accessToken);
        });
    });
});
