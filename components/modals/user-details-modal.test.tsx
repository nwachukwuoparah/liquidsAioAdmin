import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import UserDetailsModal from "./user-details-modal";
import { apiClient } from "@/lib/api/api-client";

const { showModalMock, closeModalMock } = vi.hoisted(() => ({
    showModalMock: vi.fn(),
    closeModalMock: vi.fn(),
}));

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: showModalMock,
        closeModal: closeModalMock,
    }),
}));

describe("UserDetailsModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(apiClient, "get").mockResolvedValue({
            setupToken: null,
            token: null,
            refreshTokenExpiry: null,
            body: {
                data: {
                    user: null,
                },
            },
        } as any);
    });

    it("removes stats section and recent activity when values are not present or '---'", () => {
        renderWithQueryClient(
            <UserDetailsModal
                details={{
                    id: "user-1",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@example.com",
                    accountStatus: "active",
                    verification: "pending",
                    joinedDate: "Sep 11, 2026",
                    lastActive: "---",
                    location: "---",
                    stats: {
                        totalOrders: "---",
                        totalSpent: "---",
                        avgOrderValue: "---",
                    },
                }}
            />,
        );

        // Header and basic info
        expect(screen.getByText("User details")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();

        // Valid grid fields remain
        expect(screen.getByText("Account status:")).toBeInTheDocument();
        expect(screen.getByText("active")).toBeInTheDocument();
        expect(screen.getByText("Verification:")).toBeInTheDocument();
        expect(screen.getByText("pending")).toBeInTheDocument();
        expect(screen.getByText("Joined:")).toBeInTheDocument();
        expect(screen.getByText("Sep 11, 2026")).toBeInTheDocument();

        // Missing/--- grid fields are removed
        expect(screen.queryByText("Account health:")).not.toBeInTheDocument();
        expect(screen.queryByText("Last active:")).not.toBeInTheDocument();
        expect(screen.queryByText("Location:")).not.toBeInTheDocument();

        // Entire stats section is removed
        expect(screen.queryByText(/Buyer stats:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Seller stats:/i)).not.toBeInTheDocument();
        expect(screen.queryByText("Total orders")).not.toBeInTheDocument();
        expect(screen.queryByText("Total spent")).not.toBeInTheDocument();
        expect(screen.queryByText("Average order value")).not.toBeInTheDocument();

        // Entire recent activity section is removed
        expect(screen.queryByText(/Recent activity/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Completed order/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Verification approved/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Account created/i)).not.toBeInTheDocument();
    });

    it("populates stats section when stats are provided", () => {
        renderWithQueryClient(
            <UserDetailsModal
                details={{
                    id: "user-2",
                    firstName: "Jane",
                    lastName: "Smith",
                    email: "jane@example.com",
                    accountStatus: "active",
                    role: "buyer",
                    totalOrders: 14,
                    totalSpent: 4200,
                    avgOrderValue: 300,
                }}
            />,
        );

        expect(screen.getByText("Buyer stats:")).toBeInTheDocument();
        expect(screen.getByText("Total orders")).toBeInTheDocument();
        expect(screen.getByText("14 orders")).toBeInTheDocument();
        expect(screen.getByText("Total spent")).toBeInTheDocument();
        expect(screen.getByText("$4,200")).toBeInTheDocument();
        expect(screen.getByText("Average order value")).toBeInTheDocument();
        expect(screen.getByText("$300")).toBeInTheDocument();
    });

    it("populates recent activity when activities are provided", () => {
        renderWithQueryClient(
            <UserDetailsModal
                details={{
                    id: "user-3",
                    firstName: "Robert",
                    lastName: "Taylor",
                    email: "robert@example.com",
                    accountStatus: "active",
                    activities: [
                        {
                            id: "act-1",
                            title: "Profile updated by admin",
                            timestamp: "10 minutes ago",
                        },
                    ],
                }}
            />,
        );

        expect(screen.getByText("Recent activity")).toBeInTheDocument();
        expect(screen.getByText("Profile updated by admin")).toBeInTheDocument();
        expect(screen.getByText("10 minutes ago")).toBeInTheDocument();
    });

    it("renders Seller stats and SELLER ACCOUNT label when role is seller", () => {
        renderWithQueryClient(
            <UserDetailsModal
                details={{
                    id: "user-4",
                    firstName: "Alice",
                    lastName: "Vendor",
                    email: "alice@vendor.com",
                    accountStatus: "active",
                    role: "seller",
                    totalOrders: 8,
                }}
            />,
        );

        expect(screen.getByText("SELLER ACCOUNT")).toBeInTheDocument();
        expect(screen.getByText("Seller stats:")).toBeInTheDocument();
        expect(screen.getByText("Total orders")).toBeInTheDocument();
        expect(screen.getByText("8 orders")).toBeInTheDocument();
        // Since totalSpent and avgOrderValue were not provided, only Total orders card is rendered
        expect(screen.queryByText("Total spent")).not.toBeInTheDocument();
        expect(screen.queryByText("Total sales")).not.toBeInTheDocument();
        expect(screen.queryByText("Average order value")).not.toBeInTheDocument();
    });

    it("populates location, health, and lastActive when valid values exist", () => {
        renderWithQueryClient(
            <UserDetailsModal
                details={{
                    id: "user-5",
                    firstName: "David",
                    lastName: "Miller",
                    email: "david@example.com",
                    accountStatus: "active",
                    verification: "verified",
                    joinedDate: "Jan 1, 2025",
                    accountHealth: "Good",
                    lastActive: "Just now",
                    location: "New York, USA",
                }}
            />,
        );

        expect(screen.getByText("Account health:")).toBeInTheDocument();
        expect(screen.getByText("Good")).toBeInTheDocument();
        expect(screen.getByText("Last active:")).toBeInTheDocument();
        expect(screen.getByText("Just now")).toBeInTheDocument();
        expect(screen.getByText("Location:")).toBeInTheDocument();
        expect(screen.getByText("New York, USA")).toBeInTheDocument();
    });

    it("opens Suspend account modal when clicking Suspend account", () => {
        renderWithQueryClient(
            <UserDetailsModal
                details={{
                    id: "user-6",
                    firstName: "Sam",
                    lastName: "Suspended",
                    email: "sam@example.com",
                    accountStatus: "active",
                }}
            />,
        );

        const suspendButtons = screen.getAllByRole("button", { name: /Suspend account/i });
        fireEvent.click(suspendButtons[0]);
        expect(showModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.anything(),
            }),
        );
    });
});
