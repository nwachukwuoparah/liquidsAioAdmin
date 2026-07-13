import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SetupTwoFactorFlow } from "@/components/auth/setup-two-factor-flow";

describe("SetupTwoFactorFlow", () => {
    it("shows QR setup and reveals OTP confirmation on the same screen", async () => {
        const onContinue = vi.fn();
        const onConfirmSetup = vi.fn((event) => event.preventDefault());
        const onOtpChange = vi.fn();

        render(
            <SetupTwoFactorFlow
                qrCodeImageUrl="https://example.com/qr.png"
                manualEntryCode="ABCD-1234"
                setupStep="SCAN_QR"
                otpCode=""
                isSubmitting={false}
                otpErrors={{}}
                onContinue={onContinue}
                onConfirmSetup={onConfirmSetup}
                onOtpChange={onOtpChange}
            />,
        );

        expect(screen.getByText("Link your authenticator app")).toBeInTheDocument();
        expect(screen.getByAltText("QR code for authenticator app setup")).toBeInTheDocument();
        expect(screen.getByText("ABCD-1234")).toBeInTheDocument();
        expect(screen.queryByText("Confirm setup")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Continue" }));
        expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it("renders OTP confirmation when the second step is active", async () => {
        render(
            <SetupTwoFactorFlow
                qrCodeImageUrl="https://example.com/qr.png"
                manualEntryCode="ABCD-1234"
                setupStep="CONFIRM_OTP"
                otpCode=""
                isSubmitting={false}
                otpErrors={{}}
                onContinue={vi.fn()}
                onConfirmSetup={vi.fn((event) => event.preventDefault())}
                onOtpChange={vi.fn()}
            />,
        );

        expect(
            screen.getByText("Enter the 6-digit code from your authenticator app to finish."),
        ).toBeInTheDocument();
        expect(screen.queryByText("Link your authenticator app")).not.toBeInTheDocument();
        expect(screen.queryByAltText("QR code for authenticator app setup")).not.toBeInTheDocument();
        expect(await screen.findByLabelText("Digit 1 of 6")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Confirm setup" })).toBeDisabled();
    });
});
