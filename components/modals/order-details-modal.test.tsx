import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import OrderDetailsModal from "./order-details-modal";
import type { AdminOrderRecord } from "@/lib/admin/types/admin-api.types";
import { apiClient } from "@/lib/api/api-client";

const { showModalMock } = vi.hoisted(() => ({
    showModalMock: vi.fn(),
}));

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: showModalMock,
        closeModal: vi.fn(),
    }),
}));

const SAMPLE_ORDER: AdminOrderRecord = {
    id: "1.",
    orderId: "#ORD-2024-001",
    title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers",
    seller: "Savannah Cornor",
    buyer: "John Peters",
    amount: "$9,000",
    payStatus: "Pending",
    orderStatus: "Awaiting shipment",
    date: "05-07-2025",
    colorBg: "bg-amber-100",
};

const SAMPLE_DETAIL_API_RESPONSE = {
    data: {
        id: "d4b00001-1111-4000-8000-000000000001",
        orderSummary: {
            id: "#ORD-2024-001",
            orderId: "#ORD-2024-001",
            orderStatus: "Awaiting shipment",
            quantity: 200,
            unit: "pallets",
            title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers",
        },
        paymentSummary: {
            paymentDate: "2025-07-05T14:00:00.000Z",
            amount: 9000,
            paymentAmount: "$9,000",
            shippingFee: 200,
            platformFee: 18,
            sellerNetPayout: 8782,
            payoutStatus: "In Escrow",
            payoutDate: null,
            payoutHold: null,
        },
        shippingInformation: {
            carrier: "FedEx Freight",
            trackingNumber: "FDX789456123",
            shippedOn: "2025-11-05T12:44:00.000Z",
            deliveredOn: null,
        },
        buyer: {
            name: "John Peters",
            phone: "+1 (555) 123-4567",
            email: "johnpeters@email.com",
        },
        seller: {
            name: "Savannah Cornor",
            phone: "+1 (555) 321-4567",
            email: "savannahcornor@email.com",
        },
    },
};

describe("OrderDetailsModal", () => {
    const mockClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(apiClient, "get").mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: SAMPLE_DETAIL_API_RESPONSE,
        } as any);
    });

    it("renders skeleton loader while fetching without fallback", () => {
        // Return a pending promise that never resolves during initial render
        vi.spyOn(apiClient, "get").mockImplementation(
            () => new Promise(() => {}),
        );

        renderWithQueryClient(
            <OrderDetailsModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
            />,
        );

        expect(screen.getByTestId("order-details-skeleton")).toBeInTheDocument();
    });

    it("renders parties involved, order information, shipping info, and timeline from fetched API", async () => {
        renderWithQueryClient(
            <OrderDetailsModal
                orderId="#ORD-2024-001"
                order={SAMPLE_ORDER}
                onClose={mockClose}
            />,
        );

        // Header
        expect(screen.getAllByText("Order details").length).toBeGreaterThan(0);

        await waitFor(() => {
            // Parties involved
            expect(screen.getByText("Parties involved:")).toBeInTheDocument();
            expect(screen.getAllByText("Savannah Cornor").length).toBeGreaterThan(0);
            expect(screen.getAllByText("John Peters").length).toBeGreaterThan(0);
            expect(screen.getAllByText("+1 (555) 321-4567").length).toBeGreaterThan(0);
            expect(screen.getAllByText("+1 (555) 123-4567").length).toBeGreaterThan(0);

            // Order information
            expect(screen.getByText("Order information:")).toBeInTheDocument();
            expect(screen.getByText("#ORD-2024-001")).toBeInTheDocument();
            expect(screen.getByText("$9,000")).toBeInTheDocument();
            expect(screen.getByText("200 pallets")).toBeInTheDocument();
            expect(screen.getByText("-$200")).toBeInTheDocument();
            expect(screen.getByText("-$18")).toBeInTheDocument();
            expect(screen.getByText("$8,782")).toBeInTheDocument();

            // Shipping information
            expect(screen.getByText("Shipping information:")).toBeInTheDocument();
            expect(screen.getByText("FedEx Freight")).toBeInTheDocument();
            expect(screen.getByText("FDX789456123")).toBeInTheDocument();

            // Timeline
            expect(screen.getByText("Shipment timeline:")).toBeInTheDocument();
            expect(screen.getByText("Preparing to ship")).toBeInTheDocument();
            expect(screen.getByText("In transit")).toBeInTheDocument();
            expect(screen.getByText("Delivered")).toBeInTheDocument();
            expect(screen.getByText("Order completed")).toBeInTheDocument();
        });
    });

    it("strictly excludes the 'Mark as delivered' button as requested", () => {
        renderWithQueryClient(
            <OrderDetailsModal
                order={SAMPLE_ORDER}
                onClose={mockClose}
            />,
        );

        expect(screen.queryByText(/Mark as delivered/i)).not.toBeInTheDocument();
    });

    it("renders Hold payment and Refund buyer buttons", () => {
        renderWithQueryClient(
            <OrderDetailsModal
                order={SAMPLE_ORDER}
                onClose={mockClose}
            />,
        );

        expect(screen.getByRole("button", { name: /Hold payment/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Refund buyer/i })).toBeInTheDocument();
    });

    it("opens Hold payment modal when clicking Hold payment", () => {
        renderWithQueryClient(
            <OrderDetailsModal
                order={SAMPLE_ORDER}
                onClose={mockClose}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /Hold payment/i }));
        expect(showModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                panelClassName: expect.stringContaining("max-w-[460px]"),
            }),
        );
    });

    it("opens Refund buyer modal when clicking Refund buyer", () => {
        renderWithQueryClient(
            <OrderDetailsModal
                order={SAMPLE_ORDER}
                onClose={mockClose}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /Refund buyer/i }));
        expect(showModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                panelClassName: expect.stringContaining("max-w-[460px]"),
            }),
        );
    });

    it("renders Payment on hold banner and Release funds button when order payment is on hold", async () => {
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                data: {
                    ...SAMPLE_DETAIL_API_RESPONSE.data,
                    paymentSummary: {
                        ...SAMPLE_DETAIL_API_RESPONSE.data.paymentSummary,
                        payoutStatus: "On hold",
                        payoutHold: {
                            reason: "Damaged packaging reported",
                            heldAt: "2025-11-05T00:00:00.000Z",
                            heldBy: "Samuel N.",
                        },
                    },
                },
            },
        } as any);

        renderWithQueryClient(
            <OrderDetailsModal
                orderId="#ORD-2024-001"
                onClose={mockClose}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("payment-on-hold-banner")).toBeInTheDocument();
            expect(screen.getByText("Payment on hold:")).toBeInTheDocument();
            expect(screen.getByText(/Damaged packaging reported/)).toBeInTheDocument();
            expect(screen.getByText("Nov 5, 2025")).toBeInTheDocument();
            expect(screen.getByText("Samuel N.")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Release funds/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /Release funds/i }));
        expect(showModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                panelClassName: expect.stringContaining("max-w-[460px]"),
            }),
        );
    });

    it("does not render Payment on hold banner if the cash is not on hold", async () => {
        renderWithQueryClient(
            <OrderDetailsModal
                orderId="#ORD-2024-001"
                order={SAMPLE_ORDER}
                onClose={mockClose}
            />,
        );

        await waitFor(() => {
            expect(screen.queryByTestId("payment-on-hold-banner")).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Hold payment/i })).toBeInTheDocument();
        });
    });

    it("copies tracking number to clipboard on copy click", async () => {
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockImplementation(() => Promise.resolve()),
            },
        });

        renderWithQueryClient(
            <OrderDetailsModal
                orderId="#ORD-2024-001"
                order={SAMPLE_ORDER}
                onClose={mockClose}
            />,
        );

        const copyButton = await waitFor(() =>
            screen.getByLabelText("Copy tracking number"),
        );
        fireEvent.click(copyButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("FDX789456123");
    });
});
