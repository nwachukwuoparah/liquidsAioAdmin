import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import ReleasePaymentModal from "./release-payment-modal";

const { patchMock } = vi.hoisted(() => ({
    patchMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        patch: patchMock,
    },
}));

describe("ReleasePaymentModal", () => {
    const mockClose = vi.fn();
    const mockSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        patchMock.mockResolvedValue({ body: { status: "success" } });
    });

    it("renders release payment confirmation modal", () => {
        renderWithQueryClient(
            <ReleasePaymentModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
                onSuccess={mockSuccess}
            />,
        );

        expect(screen.getByText("Release payment?")).toBeInTheDocument();
        expect(
            screen.getByText(/You are about to release this payment to the seller/i),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Yes, Release payment" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("submits release payment and triggers success callback", async () => {
        renderWithQueryClient(
            <ReleasePaymentModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
                onSuccess={mockSuccess}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Yes, Release payment" }));

        await waitFor(() => {
            expect(patchMock).toHaveBeenCalledWith(
                "/orders/admin/ORD-2024-001/payment-hold/release",
                { reason: "Admin released payment hold" },
            );
            expect(mockSuccess).toHaveBeenCalled();
            expect(mockClose).toHaveBeenCalled();
        });
    });

    it("closes modal on cancel", () => {
        renderWithQueryClient(
            <ReleasePaymentModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(mockClose).toHaveBeenCalled();
    });
});
