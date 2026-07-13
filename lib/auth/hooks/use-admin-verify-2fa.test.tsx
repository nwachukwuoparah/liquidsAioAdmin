import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAdminVerify2Fa } from "@/lib/auth/hooks/use-admin-verify-2fa";

const mockVerify2FaCode = vi.fn();

vi.mock("@/lib/auth/services/admin-auth.service", () => ({
    adminVerify2FaCode: (...args: unknown[]) => mockVerify2FaCode(...args),
}));

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

describe("useAdminVerify2Fa", () => {
    beforeEach(() => {
        mockVerify2FaCode.mockReset();
    });

    it("verifies 2FA with OTP code only", async () => {
        mockVerify2FaCode.mockResolvedValue({
            setupToken: null,
            token: "signed-in-access-token",
            body: { status: "success", message: "Authentication verified." },
        });

        const { result } = renderHook(() => useAdminVerify2Fa(), {
            wrapper: createWrapper(),
        });

        result.current.verify2FaMutation.mutate("123456");

        await waitFor(() => {
            expect(mockVerify2FaCode).toHaveBeenCalledWith("123456");
        });
    });
});
