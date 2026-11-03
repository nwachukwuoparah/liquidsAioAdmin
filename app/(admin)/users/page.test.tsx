import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AllUsersBody from "./page";

const { useAdminUsersMock, showModalMock } = vi.hoisted(() => ({
    useAdminUsersMock: vi.fn(),
    showModalMock: vi.fn(),
}));

vi.mock("@/lib/admin/hooks", () => ({
    useAdminUsers: (params: Record<string, string>) => useAdminUsersMock(params),
    useAdminUserStats: () => ({
        data: {
            data: {
                stats: {
                    totalUsers: { count: 12, delta: 2 },
                    activeBuyers: { count: 8, delta: 1 },
                    activeSellers: { count: 4, delta: 1 },
                    suspendedAccounts: { count: 1, delta: 0 },
                },
            },
        },
        isLoading: false,
        error: null,
    }),
    useAdminUserTabCounts: () => ({
        tabCounts: { buyers: 8, sellers: 4, reported: 1 },
        isLoading: false,
        isError: false,
    }),
}));

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: showModalMock,
        closeModal: vi.fn(),
    }),
}));

describe("AllUsersBody page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAdminUsersMock.mockReturnValue({
            data: {
                status: "success",
                data: {
                    users: [
                        {
                            id: "u1",
                            firstName: "John",
                            lastName: "Doe",
                            email: "john@example.com",
                            totalOrders: 3,
                            lastActive: "Today",
                            accountStatus: "active",
                            complianceReviewStatus: "pending",
                        },
                    ],
                },
            },
            isLoading: false,
            error: null,
        });
    });

    it("renders valid filters (Compliance status, Account status, Joined date) and excludes Location", () => {
        render(<AllUsersBody />);

        expect(screen.getByText("Compliance status")).toBeInTheDocument();
        expect(screen.getAllByText("Account status").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Joined date")).toBeInTheDocument();
        // Location is not on the server, so it must not be rendered
        expect(screen.queryByText("Location")).not.toBeInTheDocument();
    });

    it("defaults to accountType=buyer in query params", () => {
        render(<AllUsersBody />);

        expect(useAdminUsersMock).toHaveBeenCalledWith(
            expect.objectContaining({
                accountType: "buyer",
            }),
        );
    });

    it("switches to accountType=seller when Sellers tab is clicked", () => {
        render(<AllUsersBody />);

        const sellersTabs = screen.getAllByRole("button", { name: "Sellers" });
        fireEvent.click(sellersTabs[0]);

        expect(useAdminUsersMock).toHaveBeenCalledWith(
            expect.objectContaining({
                accountType: "seller",
            }),
        );
    });

    it("switches to reported_users=true without accountType when Reported tab is clicked", () => {
        render(<AllUsersBody />);

        const reportedTabs = screen.getAllByRole("button", { name: "Reported" });
        fireEvent.click(reportedTabs[0]);

        expect(useAdminUsersMock).toHaveBeenCalledWith(
            expect.objectContaining({
                reported_users: "true",
            }),
        );
        const lastCall = useAdminUsersMock.mock.calls.at(-1)?.[0];
        expect(lastCall?.accountType).toBeUndefined();
    });

    it("passes search query parameter q when typing in the search box", () => {
        render(<AllUsersBody />);

        const searchInput = screen.getByPlaceholderText("Search people by name or email...");
        fireEvent.change(searchInput, { target: { value: "mag" } });

        expect(useAdminUsersMock).toHaveBeenCalledWith(
            expect.objectContaining({
                q: "mag",
            }),
        );
    });

    it("opens UserFiltersModal when the mobile filter button is clicked", () => {
        render(<AllUsersBody />);

        const filterButton = screen.getByRole("button", { name: "Open filters" });
        fireEvent.click(filterButton);

        expect(showModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                cover: true,
            }),
        );
    });
});
