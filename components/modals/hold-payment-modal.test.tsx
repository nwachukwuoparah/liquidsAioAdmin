import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import HoldPaymentModal from "./hold-payment-modal";

const { patchMock } = vi.hoisted(() => ({
    patchMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        patch: patchMock,
    },
}));

describe("HoldPaymentModal", () => {
    const mockClose = vi.fn();
    const mockSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        patchMock.mockResolvedValue({ body: { status: "success" } });
    });

    it("renders modal header, description, and textarea", () => {
        renderWithQueryClient(
            <HoldPaymentModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
                onSuccess={mockSuccess}
            />,
        );

        expect(screen.getByText("Hold payment?")).toBeInTheDocument();
        expect(
            screen.getByText(/You are about to place a hold on this payment/i),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Enter reason for hold")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Hold payment" })).toBeDisabled();
    });

    it("submits hold payment with reason and closes modal", async () => {
        renderWithQueryClient(
            <HoldPaymentModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
                onSuccess={mockSuccess}
            />,
        );

        const textarea = screen.getByPlaceholderText("Write a reason here...");
        fireEvent.change(textarea, { target: { value: "Buyer reported missing pallet" } });

        const submitBtn = screen.getByRole("button", { name: "Hold payment" });
        expect(submitBtn).not.toBeDisabled();
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(patchMock).toHaveBeenCalledWith(
                "/orders/admin/ORD-2024-001/payment-hold",
                { reason: "Buyer reported missing pallet" },
            );
            expect(mockSuccess).toHaveBeenCalled();
            expect(mockClose).toHaveBeenCalled();
        });
    });

    it("closes modal on cancel", () => {
        renderWithQueryClient(
            <HoldPaymentModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(mockClose).toHaveBeenCalled();
    });
});
