import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import SignUpPage from "@/app/(auth)/sign-up/page";
import SetupTwoFactorPage from "@/app/(auth)/setup-2fa/page";
import VerifyAuthenticationPage from "@/app/(auth)/verify/page";
import { OtpInput } from "@/components/auth/otp-input";
import {
    encodeSetupAuthFlowPayload,
} from "@/lib/auth/utilities/auth-flow-payload";

const mockReplaceBrowserHistoryRoute = vi.fn();
const mockMutate = vi.fn();
const mockAdminSignup = vi.fn();
const mockAdminGetAuthenticatorAppSetup = vi.fn();
const mockAdminVerify2FaCode = vi.fn();
const mockSetAccessToken = vi.fn();
const mockClearEphemeralAuthFlowCookies = vi.fn();
const mockNavigationState = vi.hoisted(() => ({
    searchParams: new URLSearchParams("email=admin@liquidsaio.com"),
}));

vi.mock("next/navigation", () => ({
    useSearchParams: () => mockNavigationState.searchParams,
    usePathname: () => "/login",
}));

vi.mock("@/lib/auth/utilities/replace-browser-history-route", () => ({
    replaceBrowserHistoryRoute: (...args: unknown[]) => mockReplaceBrowserHistoryRoute(...args),
}));

vi.mock("@/lib/auth/hooks/use-admin-login", () => ({
    useAdminLogin: () => ({
        mutate: mockMutate,
        isPending: false,
        error: null,
    }),
}));

vi.mock("@/lib/auth/services/admin-auth.service", () => ({
    adminSignup: (...args: unknown[]) => mockAdminSignup(...args),
    adminGetAuthenticatorAppSetup: (...args: unknown[]) =>
        mockAdminGetAuthenticatorAppSetup(...args),
    adminVerify2FaCode: (...args: unknown[]) => mockAdminVerify2FaCode(...args),
}));

vi.mock("@/lib/auth/utilities/auth-token-storage", () => ({
    setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
    hasAuthSession: () => true,
    clearEphemeralAuthFlowCookies: (...args: unknown[]) =>
        mockClearEphemeralAuthFlowCookies(...args),
}));

function renderWithQueryProvider(ui: ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("LoginPage", () => {
    beforeEach(() => {
        mockReplaceBrowserHistoryRoute.mockClear();
        mockMutate.mockClear();
    });

    it("renders login form fields", () => {
        renderWithQueryProvider(<LoginPage />);

        expect(screen.getByText("Welcome back. Enter account details to login.")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    });

    it("submits validated login credentials through the mutation hook", async () => {
        renderWithQueryProvider(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "admin@liquidsaio.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Login" }));

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith({
                email: "admin@liquidsaio.com",
                password: "password123",
            });
        });
    });

    it("shows validation errors for invalid form input", async () => {
        renderWithQueryProvider(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "invalid-email" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "short" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Login" }));

        expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
        expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
        expect(mockMutate).not.toHaveBeenCalled();
    });
});

describe("SignUpPage", () => {
    const sampleInviteToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleV8xIn0.eyJ0eXBlIjoiYWRtaW4iLCJ0YXJnZXQiOiIwMTllZTRjMi1mNzU5LTcyZjktODBjNC0yZTM1OGJiMmJjMjAiLCJlbWFpbCI6Im53YWNodWt3dW9wYXJhaEBnbWFpbC5jb20iLCJyb2xlTmFtZSI6InN1cGVyQWRtaW4iLCJpYXQiOjE3ODE5NTQ0NDMsImV4cCI6MTc4MjU1OTI0M30._ylcpeTyWGrNTC6EUTT-L3xI8nxadzGwr1BFaIff8Zc";

    beforeEach(() => {
        mockNavigationState.searchParams = new URLSearchParams(`token=${sampleInviteToken}`);
        mockReplaceBrowserHistoryRoute.mockClear();
        mockClearEphemeralAuthFlowCookies.mockClear();
        mockAdminSignup.mockReset();
        mockAdminSignup.mockResolvedValue({
            email: "nwachukwuoparah@gmail.com",
            setupToken: "signup-setup-token",
            accessToken: "signup-access-token",
            message: "Account created.",
            data: { email: "nwachukwuoparah@gmail.com" },
        });
    });

    it("shows access denied when invite token is missing", () => {
        mockNavigationState.searchParams = new URLSearchParams();

        renderWithQueryProvider(<SignUpPage />);

        expect(screen.getByText("Access denied")).toBeInTheDocument();
        expect(
            screen.getByText(
                "You do not have permission to access this page. Please contact your administrator for an invite link.",
            ),
        ).toBeInTheDocument();
        expect(screen.queryByText("Create your account")).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument();
    });

    it("prefills invite email from token as read-only", () => {
        renderWithQueryProvider(<SignUpPage />);

        expect(screen.getByDisplayValue("nwachukwuoparah@gmail.com")).toBeDisabled();
        expect(screen.getByText("Create your account")).toBeInTheDocument();
    });

    it("routes to 2FA setup after valid sign-up submission", async () => {
        renderWithQueryProvider(<SignUpPage />);

        fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Samuel" } });
        fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Nathaniel" } });
        fireEvent.change(screen.getByPlaceholderText("Enter phone number"), {
            target: { value: "+12025550123" },
        });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
        fireEvent.change(screen.getByLabelText("Confirm password"), {
            target: { value: "password123" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Create account" }));

        await waitFor(() => {
            expect(mockAdminSignup).toHaveBeenCalled();
            expect(mockClearEphemeralAuthFlowCookies).toHaveBeenCalledTimes(1);
            expect(mockReplaceBrowserHistoryRoute).toHaveBeenCalledTimes(1);
        });

        const replacedRoute = mockReplaceBrowserHistoryRoute.mock.calls[0]?.[0] as string;
        const replacedToken = new URL(`http://localhost${replacedRoute}`).searchParams.get("token");

        expect(replacedRoute.startsWith("/setup-2fa?token=")).toBe(true);
        expect(replacedToken).toBe(
            encodeSetupAuthFlowPayload({
                setupToken: "signup-setup-token",
                data: { email: "nwachukwuoparah@gmail.com" },
            }),
        );
    });

    it("shows error when passwords do not match", async () => {
        renderWithQueryProvider(<SignUpPage />);

        fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Samuel" } });
        fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Nathaniel" } });
        fireEvent.change(screen.getByPlaceholderText("Enter phone number"), {
            target: { value: "+12025550123" },
        });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
        fireEvent.change(screen.getByLabelText("Confirm password"), {
            target: { value: "different-password" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Create account" }));

        expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
        expect(mockReplaceBrowserHistoryRoute).not.toHaveBeenCalled();
    });
});

describe("SetupTwoFactorPage", () => {
    beforeEach(() => {
        const encodedSetupPayload = encodeSetupAuthFlowPayload({
            setupToken: "demo-setup-token",
            data: {},
        });
        mockNavigationState.searchParams = new URLSearchParams(`token=${encodedSetupPayload}`);
        mockReplaceBrowserHistoryRoute.mockClear();
        mockAdminGetAuthenticatorAppSetup.mockReset();
        mockAdminGetAuthenticatorAppSetup.mockResolvedValue({
            qrCodeImageUrl: "https://example.com/qr.png",
            manualEntryCode: "ABCD-1234",
        });
    });

    it("shows QR setup and moves to OTP confirmation on the same screen", async () => {
        renderWithQueryProvider(<SetupTwoFactorPage />);

        expect(await screen.findByText("Link your authenticator app")).toBeInTheDocument();
        expect(screen.getByAltText("QR code for authenticator app setup")).toBeInTheDocument();
        expect(screen.getByText("ABCD-1234")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Continue" }));

        expect(await screen.findByLabelText("Digit 1 of 6")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Confirm setup" })).toBeDisabled();
    });
});

describe("VerifyAuthenticationPage", () => {
    beforeEach(() => {
        mockNavigationState.searchParams = new URLSearchParams();
        mockReplaceBrowserHistoryRoute.mockClear();
        mockAdminVerify2FaCode.mockReset();
        mockSetAccessToken.mockReset();
        mockAdminVerify2FaCode.mockResolvedValue({
            setupToken: null,
            token: "signed-in-access-token",
            refreshTokenExpiry: null,
            body: { status: "success", message: "Authentication verified." },
        });
    });

    it("renders OTP inputs and verify action", async () => {
        renderWithQueryProvider(<VerifyAuthenticationPage />);

        expect(await screen.findByText("Verify authentication")).toBeInTheDocument();
        expect(screen.getByLabelText("Digit 1 of 6")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Verify and continue" })).toBeDisabled();
    });

    it("routes to dashboard after entering full OTP", async () => {
        renderWithQueryProvider(<VerifyAuthenticationPage />);

        await screen.findByText("Verify authentication");

        for (let digitIndex = 0; digitIndex < 6; digitIndex += 1) {
            fireEvent.change(screen.getByLabelText(`Digit ${digitIndex + 1} of 6`), {
                target: { value: String(digitIndex + 1) },
            });
        }

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Verify and continue" })).not.toBeDisabled();
        });

        fireEvent.click(screen.getByRole("button", { name: "Verify and continue" }));

        await waitFor(() => {
            expect(mockAdminVerify2FaCode).toHaveBeenCalledWith("123456");
            expect(mockSetAccessToken).toHaveBeenCalledWith("signed-in-access-token");
            expect(mockReplaceBrowserHistoryRoute).toHaveBeenCalledWith("/overview");
        });
    });
});

describe("OtpInput", () => {
    it("accepts pasted OTP codes", () => {
        const handleChange = vi.fn();
        render(<OtpInput value="" onChange={handleChange} />);

        fireEvent.paste(screen.getByLabelText("Digit 1 of 6"), {
            clipboardData: { getData: () => "123456" },
        });

        expect(handleChange).toHaveBeenCalledWith("123456");
    });
});
