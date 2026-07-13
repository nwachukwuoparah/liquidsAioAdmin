import { beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { clearAllCookiesForTests } from "@/lib/helpers/cookie-storage";

const mockReplaceBrowserHistoryRoute = vi.fn();
const mockVerify2FaCode = vi.fn();
const mockSetAccessToken = vi.fn();
const mockHasAuthSession = vi.fn();

vi.mock("@/lib/auth/utilities/replace-browser-history-route", () => ({
    replaceBrowserHistoryRoute: (...args: unknown[]) => mockReplaceBrowserHistoryRoute(...args),
}));

vi.mock("@/lib/auth/services/admin-auth.service", () => ({
    adminVerify2FaCode: (...args: unknown[]) => mockVerify2FaCode(...args),
}));

vi.mock("@/lib/auth/utilities/auth-token-storage", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/auth/utilities/auth-token-storage")>();

    return {
        ...actual,
        setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
        hasAuthSession: (...args: unknown[]) => mockHasAuthSession(...args),
    };
});

const mockLogAndPersistRefreshTokenExpiry = vi.fn();

vi.mock("@/lib/auth/utilities/refresh-token-expiry-storage", () => ({
    logAndPersistRefreshTokenExpiry: (...args: unknown[]) =>
        mockLogAndPersistRefreshTokenExpiry(...args),
    flushPendingRefreshTokenExpiryLog: vi.fn(),
}));

async function loadVerifyPageModule() {
    return import("@/app/(auth)/verify/page");
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

describe("VerifyAuthenticationPage", () => {
    beforeEach(() => {
        clearAllCookiesForTests();
        mockReplaceBrowserHistoryRoute.mockReset();
        mockVerify2FaCode.mockReset();
        mockSetAccessToken.mockReset();
        mockHasAuthSession.mockReset();
        mockHasAuthSession.mockReturnValue(true);
    });

    it("calls verify-2fa-code with OTP only and routes to dashboard on success", async () => {
        mockVerify2FaCode.mockResolvedValue({
            setupToken: null,
            token: "signed-in-access-token",
            refreshTokenExpiry: "2026-12-31T23:59:59.000Z",
            body: { status: "success", message: "Authentication verified." },
        });

        const { default: VerifyAuthenticationPage } = await loadVerifyPageModule();
        const { render, screen, fireEvent } = await import("@testing-library/react");

        render(<VerifyAuthenticationPage />, { wrapper: createWrapper() });

        const otpInputs = await screen.findAllByRole("textbox");
        "123456".split("").forEach((digit, index) => {
            fireEvent.change(otpInputs[index], { target: { value: digit } });
        });

        fireEvent.click(screen.getByRole("button", { name: "Verify and continue" }));

        await waitFor(() => {
            expect(mockVerify2FaCode).toHaveBeenCalledWith("123456");
        });

        await waitFor(() => {
            expect(mockSetAccessToken).toHaveBeenCalledWith("signed-in-access-token");
            expect(mockReplaceBrowserHistoryRoute).toHaveBeenCalledWith("/overview");
        });
    });

    it("shows session expired when no access token cookie is present", async () => {
        mockHasAuthSession.mockReturnValue(false);

        const { default: VerifyAuthenticationPage } = await loadVerifyPageModule();
        const { render, screen } = await import("@testing-library/react");

        render(<VerifyAuthenticationPage />, { wrapper: createWrapper() });

        expect(await screen.findByText("Session expired")).toBeInTheDocument();
        expect(mockVerify2FaCode).not.toHaveBeenCalled();
    });

    it("renders a stable loading shell before reading the session cookie", async () => {
        mockHasAuthSession.mockReturnValue(true);

        const { default: VerifyAuthenticationPage } = await loadVerifyPageModule();
        const { render, screen } = await import("@testing-library/react");

        render(<VerifyAuthenticationPage />, { wrapper: createWrapper() });

        expect(await screen.findByText("Verify authentication")).toBeInTheDocument();
        expect(screen.queryByText("Session expired")).not.toBeInTheDocument();
    });
});
