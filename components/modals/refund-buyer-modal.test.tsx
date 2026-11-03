import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import RefundBuyerModal from "./refund-buyer-modal";

const { postMock } = vi.hoisted(() => ({
    postMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        post: postMock,
    },
}));

describe("RefundBuyerModal", () => {
    const mockClose = vi.fn();
    const mockSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        postMock.mockResolvedValue({ body: { status: "success" } });
    });

    it("renders modal header, description with amount and buyer, and textarea", () => {
        renderWithQueryClient(
            <RefundBuyerModal
                orderId="#ORD-2024-001"
                amount="$9,000"
                buyerName="John Peters"
                onClose={mockClose}
                onSuccess={mockSuccess}
            />,
        );

        expect(screen.getByText("Refund buyer?")).toBeInTheDocument();
        expect(
            screen.getByText(/Are you sure you want to refund/i),
        ).toBeInTheDocument();
        expect(screen.getByText("$9,000")).toBeInTheDocument();
        expect(screen.getByText("John Peters")).toBeInTheDocument();
        expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Enter reason for refund")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Issue refund" })).toBeDisabled();
    });

    it("submits refund with reason and closes modal", async () => {
        renderWithQueryClient(
            <RefundBuyerModal
                orderId="#ORD-2024-001"
                amount="$9,000"
                buyerName="John Peters"
                onClose={mockClose}
                onSuccess={mockSuccess}
            />,
        );

        const textarea = screen.getByPlaceholderText("Write a reason here...");
        fireEvent.change(textarea, { target: { value: "Item damaged in transit beyond repair" } });

        const submitBtn = screen.getByRole("button", { name: "Issue refund" });
        expect(submitBtn).not.toBeDisabled();
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith(
                "/orders/admin/ORD-2024-001/refund",
                { reason: "Item damaged in transit beyond repair" },
            );
            expect(mockSuccess).toHaveBeenCalled();
            expect(mockClose).toHaveBeenCalled();
        });
    });

    it("closes modal on cancel", () => {
        renderWithQueryClient(
            <RefundBuyerModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(mockClose).toHaveBeenCalled();
    });

    it("closes modal on close icon click", () => {
        renderWithQueryClient(
            <RefundBuyerModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
        expect(mockClose).toHaveBeenCalled();
    });
});
