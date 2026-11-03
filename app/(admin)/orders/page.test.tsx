import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import AllOrdersDashboardContentSection from "./page";

const { getMock, showModalMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
    showModalMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: getMock,
        post: vi.fn(),
    },
}));

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: showModalMock,
        closeModal: vi.fn(),
    }),
}));

const SAMPLE_ORDERS_PAGE_DATA = {
    status: "success",
    data: {
        orders: [
            {
                id: "order-1",
                order_id: "#ORD-2024-001",
                lot: {
                    id: "lot-1",
                    title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers",
                    thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=60",
                },
                seller: { name: "Savannah Nguyen" },
                buyer: { name: "John Peters" },
                amount: 9000,
                payment_status: "processing",
                order_status: "active",
                created_at: "2025-07-05T14:32:00.000Z",
                alert: false,
            },
            {
                id: "order-2",
                order_id: "#ORD-2024-002",
                lot: {
                    id: "lot-2",
                    title: "Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)",
                    thumbnailUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&auto=format&fit=crop&q=60",
                },
                seller: { name: "Ronald Richards" },
                buyer: { name: "Wade Warren" },
                amount: 1500,
                payment_status: "succeeded",
                order_status: "active",
                created_at: "2025-07-04T09:15:00.000Z",
                alert: true,
            },
        ],
        totalCount: 3598,
        hasNext: true,
        nextCursor: {
            cursor_id: "order-2",
            cursor_sort_at: "2025-07-04T09:15:00.000Z",
            cursor_search_rank: 0,
        },
    },
};

describe("AllOrdersDashboardContentSection", () => {
    beforeEach(() => {
        getMock.mockReset();
        showModalMock.mockReset();
        getMock.mockImplementation(async (path: string) => {
            if (path.includes("/admins/overview")) {
                return {
                    body: {
                        status: "success",
                        data: {
                            totalOrders: { count: 2486, deltaPercentage: null },
                            activeOrders: { count: 307, deltaPercentage: 12 },
                            completedOrders: { count: 115, deltaPercentage: 3 },
                            disputedOrders: { count: 19, deltaPercentage: -2 },
                            allRefundsIssued: { count: 30, deltaPercentage: 3 },
                            currentlyInEscrow: { total: 49500, deltaPercentage: 3 },
                            avgOrderValue: { total: 2342, deltaPercentage: 5 },
                            platformFees: { total: 3209, deltaPercentage: -12 },
                        },
                    },
                };
            }

            if (path.includes("/orders/admin")) {
                return {
                    body: SAMPLE_ORDERS_PAGE_DATA,
                };
            }

            return { body: {} };
        });
    });

    it("renders the 8 quick stats cards matching server response", async () => {
        renderWithQueryClient(<AllOrdersDashboardContentSection />);

        expect(screen.getByText("Quick stats")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Total Orders (YTD)")).toBeInTheDocument();
            expect(screen.getByText("Active Orders")).toBeInTheDocument();
            expect(screen.getByText("Completed Orders")).toBeInTheDocument();
            expect(screen.getByText("Disputed Orders")).toBeInTheDocument();
            expect(screen.getByText("All Refunds Issued")).toBeInTheDocument();
            expect(screen.getByText("Currently in Escrow")).toBeInTheDocument();
            expect(screen.getByText("Avg. Order Value")).toBeInTheDocument();
            expect(screen.getByText("Platform Fees Earning")).toBeInTheDocument();
        });

        expect(screen.getByText("—")).toBeInTheDocument();
        expect(getMock).toHaveBeenCalledWith(
            "/admins/overview",
            undefined,
        );
    });

    it("renders activeMembers, pendingInvites, and revokedAdmins cards when returned by overview API", async () => {
        getMock.mockImplementation(async (path: string) => {
            if (path.includes("/admins/overview")) {
                return {
                    body: {
                        status: "success",
                        data: {
                            activeMembers: 2,
                            pendingInvites: 0,
                            revokedAdmins: 0,
                        },
                    },
                };
            }

            if (path.includes("/orders/admin")) {
                return {
                    body: SAMPLE_ORDERS_PAGE_DATA,
                };
            }

            return { body: {} };
        });

        renderWithQueryClient(<AllOrdersDashboardContentSection />);

        await waitFor(() => {
            expect(screen.getByText("Active Members")).toBeInTheDocument();
            expect(screen.getByText("Pending Invites")).toBeInTheDocument();
            expect(screen.getByText("Revoked Admins")).toBeInTheDocument();
        });

        expect(screen.getAllByText("2").length).toBeGreaterThan(0);
        expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);

        // Verify other unused cards are removed
        expect(screen.queryByText("Completed Orders")).not.toBeInTheDocument();
        expect(screen.queryByText("Avg. Order Value")).not.toBeInTheDocument();
        expect(screen.queryByText("Platform Fees Earning")).not.toBeInTheDocument();
    });

    it("renders orders table rows with lot thumbnails, alert badges, badges, and details", async () => {
        renderWithQueryClient(<AllOrdersDashboardContentSection />);

        await waitFor(() => {
            expect(screen.getAllByText("#ORD-2024-001").length).toBeGreaterThan(0);
            expect(screen.getAllByText("#ORD-2024-002").length).toBeGreaterThan(0);
        });

        // Check lot titles (present in both mobile and desktop views)
        expect(screen.getAllByText("Mixed Electronics Pallet – Headphones, Speakers, Chargers").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)").length).toBeGreaterThan(0);

        // Check seller and buyer names
        expect(screen.getAllByText("Savannah Nguyen").length).toBeGreaterThan(0);
        expect(screen.getAllByText("John Peters").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Ronald Richards").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Wade Warren").length).toBeGreaterThan(0);

        // Check amounts
        expect(screen.getAllByText("$9,000").length).toBeGreaterThan(0);
        expect(screen.getAllByText("$1,500").length).toBeGreaterThan(0);

        // Check dispute alert badge
        expect(screen.getAllByLabelText("Dispute alert").length).toBeGreaterThan(0);

        // Check view buttons
        expect(screen.getAllByLabelText("View order details").length).toBeGreaterThan(0);
    });

    it("launches OrderDetailsModal when clicking view button", async () => {
        renderWithQueryClient(<AllOrdersDashboardContentSection />);

        await waitFor(() => {
            expect(screen.getAllByLabelText("View order details").length).toBeGreaterThan(0);
        });

        const viewButtons = screen.getAllByLabelText("View order details");
        fireEvent.click(viewButtons[0]);

        expect(showModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                panelClassName: expect.stringContaining("max-w-[560px]"),
            }),
        );
    });

    it("renders table pagination with rows per page and total results", async () => {
        renderWithQueryClient(<AllOrdersDashboardContentSection />);

        await waitFor(() => {
            expect(screen.getAllByText(/Showing 1-10 of 3,598 results/i).length).toBeGreaterThan(0);
        });

        expect(screen.getAllByTestId("table-pagination-page-size").length).toBeGreaterThan(0);
        expect(screen.getAllByTestId("table-pagination-previous")[0]).toBeDisabled();
        expect(screen.getAllByTestId("table-pagination-next")[0]).not.toBeDisabled();
    });

    it("filters orders by tab when clicking Active orders tab", async () => {
        renderWithQueryClient(<AllOrdersDashboardContentSection />);

        await waitFor(() => {
            expect(screen.getAllByText("#ORD-2024-001").length).toBeGreaterThan(0);
        });

        const activeOrdersTabs = screen.getAllByRole("button", { name: "Active orders" });
        fireEvent.click(activeOrdersTabs[0]);

        await waitFor(() => {
            expect(getMock).toHaveBeenCalledWith(
                "/orders/admin",
                expect.objectContaining({
                    order_status: "active",
                }),
            );
        });
    });

    it("shows empty state and does not show error when clicking Dispute / Refunds tab even if backend errors", async () => {
        getMock.mockImplementation(async (path: string, params?: Record<string, unknown>) => {
            if (path.includes("/admins/overview")) {
                return {
                    body: {
                        status: "success",
                        data: { activeMembers: 2, pendingInvites: 0, revokedAdmins: 0 },
                    },
                };
            }

            if (params?.order_status === "dispute_or_refunded") {
                throw new Error("500 Internal Server Error");
            }

            if (path.includes("/orders/admin")) {
                return {
                    body: SAMPLE_ORDERS_PAGE_DATA,
                };
            }

            return { body: {} };
        });

        renderWithQueryClient(<AllOrdersDashboardContentSection />);

        await waitFor(() => {
            expect(screen.getAllByText("#ORD-2024-001").length).toBeGreaterThan(0);
        });

        const disputeTabs = screen.getAllByRole("button", { name: "Dispute / Refunds" });
        fireEvent.click(disputeTabs[0]);

        await waitFor(() => {
            expect(screen.getAllByText("No orders found").length).toBeGreaterThan(0);
        });

        expect(screen.queryByText(/Unable to load data/i)).not.toBeInTheDocument();
    });

    it("renders valid API filters and excludes removed buyer/seller dropdown filters", async () => {
        renderWithQueryClient(<AllOrdersDashboardContentSection />);

        await waitFor(() => {
            expect(screen.getAllByText("#ORD-2024-001").length).toBeGreaterThan(0);
        });

        // Supported filters are present
        expect(screen.getByRole("button", { name: /Order Status/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Payment status/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Date range/i })).toBeInTheDocument();

        // Removed dummy filters are not present
        expect(screen.queryByRole("button", { name: /Buyer name/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Seller name/i })).not.toBeInTheDocument();
    });
});
