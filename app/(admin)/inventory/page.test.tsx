import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import AllLotsContentSection from "./page";

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

const SAMPLE_LOT_API_RECORD = {
    id: "lot-1",
    title: "Mixed electronics pallet – headphones, speakers, chargers",
    category: "elt",
    condition: "mixed",
    unitQuantity: 50,
    minimumOrderQuantity: 10,
    price: 200,
    reviewStatus: "pending",
    createdAt: "2026-07-01T12:00:00.000Z",
    creator: {
        firstName: "John",
        lastName: "stockton",
    },
};

function mockInventoryApiResponses() {
    getMock.mockImplementation(async (path: string, params: Record<string, string> = {}) => {
        if (path.includes("/lots/admin-overview")) {
            return {
                body: {
                    status: "success",
                    data: {
                        stats: {
                            allListings: { count: 0, delta: -109 },
                            activeListings: { count: 0, delta: -9 },
                            declinedListings: { count: 1, delta: 1 },
                            suspendedListings: { count: 1, delta: 1 },
                        },
                    },
                },
            };
        }

        if (path === "/lots") {
            if (params.review_status === "pending") {
                return {
                    body: {
                        status: "success",
                        data: { lots: [], count: 12 },
                    },
                };
            }

            if (params.reported_lots === "true") {
                return {
                    body: {
                        status: "success",
                        data: { lots: [], count: 3 },
                    },
                };
            }

            if (params.review_status === "suspended") {
                return {
                    body: {
                        status: "success",
                        data: { lots: [], count: 1 },
                    },
                };
            }

            return {
                body: {
                    status: "success",
                    data: {
                        lots: [SAMPLE_LOT_API_RECORD],
                        count: 50,
                    },
                },
            };
        }

        return {
            body: {
                status: "success",
                data: { lots: [], count: 0 },
            },
        };
    });
}

describe("AllLotsContentSection mobile layout", () => {
    beforeEach(() => {
        getMock.mockReset();
        showModalMock.mockClear();
    });

    it("opens the mobile inventory filters modal", async () => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: query === "(max-width: 767px)",
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        mockInventoryApiResponses();
        renderWithQueryClient(<AllLotsContentSection />);

        expect((await screen.findAllByText("John stockton")).length).toBeGreaterThan(0);

        fireEvent.click(screen.getByLabelText("Open filters"));

        expect(showModalMock).toHaveBeenCalledTimes(1);
        const modalPayload = showModalMock.mock.calls[0][0];
        expect(modalPayload.cover).toBe(true);
        expect(modalPayload.panelClassName).toContain("!w-full");
        expect(typeof modalPayload.content).toBe("function");
    });

    it("does not open the filter modal on desktop widths", async () => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        mockInventoryApiResponses();
        renderWithQueryClient(<AllLotsContentSection />);

        expect((await screen.findAllByText("John stockton")).length).toBeGreaterThan(0);

        fireEvent.click(screen.getByLabelText("Open filters"));

        expect(showModalMock).not.toHaveBeenCalled();
    });

    it("renders a full-width mobile panel with shadowed lot cards", async () => {
        mockInventoryApiResponses();
        const { container } = renderWithQueryClient(<AllLotsContentSection />);

        expect((await screen.findAllByText("John stockton")).length).toBeGreaterThan(0);

        const mobilePanel = container.querySelector(".rounded-t-\\[32px\\].md\\:hidden");
        expect(mobilePanel).toBeInTheDocument();
        expect(mobilePanel).toHaveClass("w-full", "shadow-card");

        const lotCards = within(mobilePanel as HTMLElement).getAllByTestId("mobile-lot-card");
        expect(lotCards.length).toBeGreaterThan(0);
        lotCards.forEach((card) => {
            expect(card.className).toContain("shadow-card");
            expect(card.className).toContain("border-0");
            expect(card.className).not.toContain("border-[#0B0E0514]");
        });
    });

    it("renders seller and item stats inside mobile lot cards", async () => {
        mockInventoryApiResponses();
        const { container } = renderWithQueryClient(<AllLotsContentSection />);

        expect((await screen.findAllByText("John stockton")).length).toBeGreaterThan(0);

        const mobilePanel = container.querySelector(".rounded-t-\\[32px\\].md\\:hidden") as HTMLElement;
        const firstCard = within(mobilePanel).getAllByTestId("mobile-lot-card")[0];

        expect(within(firstCard).getByText("John stockton")).toBeInTheDocument();
        expect(within(firstCard).getByText(/50 items/i)).toBeInTheDocument();
        expect(within(firstCard).getByText("$200")).toBeInTheDocument();
    });

    it("switches mobile filter tabs and requests tab query params", async () => {
        mockInventoryApiResponses();
        const { container } = renderWithQueryClient(<AllLotsContentSection />);

        expect((await screen.findAllByText("John stockton")).length).toBeGreaterThan(0);

        const mobilePanel = container.querySelector(".rounded-t-\\[32px\\].md\\:hidden") as HTMLElement;
        const suspendedTab = within(mobilePanel).getByRole("button", { name: /Suspended/ });
        fireEvent.click(suspendedTab);

        expect(suspendedTab.className).toContain("border-[#518300]");

        await waitFor(() => {
            expect(getMock).toHaveBeenCalledWith(
                "/lots",
                expect.objectContaining({
                    review_status: "suspended",
                }),
            );
        });
    });

    it("passes search query to GET /lots", async () => {
        mockInventoryApiResponses();
        renderWithQueryClient(<AllLotsContentSection />);

        expect(await screen.findAllByPlaceholderText("Search lots by title")).toHaveLength(2);

        fireEvent.change(screen.getAllByPlaceholderText("Search lots by title")[0], {
            target: { value: "electronics" },
        });

        await waitFor(() => {
            expect(getMock).toHaveBeenCalledWith(
                "/lots",
                expect.objectContaining({
                    search: "electronics",
                }),
            );
        });
    });

    it("passes page and limit params to GET /lots", async () => {
        mockInventoryApiResponses();
        renderWithQueryClient(<AllLotsContentSection />);

        expect(await screen.findAllByText("Showing 1-25 of 50 results")).toHaveLength(2);
        expect(getMock).toHaveBeenCalledWith(
            "/lots",
            expect.objectContaining({
                page: "1",
                limit: "25",
            }),
        );

        const nextButtons = screen.getAllByTestId("table-pagination-next");
        const enabledNextButton = nextButtons.find((button) => !button.hasAttribute("disabled"));
        expect(enabledNextButton).toBeDefined();

        fireEvent.click(enabledNextButton as HTMLButtonElement);

        await waitFor(() => {
            expect(getMock).toHaveBeenCalledWith(
                "/lots",
                expect.objectContaining({
                    page: "2",
                    limit: "25",
                }),
            );
        });
    });

    it("shows counts on all inventory tabs", async () => {
        mockInventoryApiResponses();
        renderWithQueryClient(<AllLotsContentSection />);

        await waitFor(() => {
            expect(screen.getAllByRole("button", { name: /All Lots 50/ }).length).toBeGreaterThan(0);
        });
        expect(screen.getAllByRole("button", { name: /Pending approval 12/ }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("button", { name: /Reported 3/ }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("button", { name: /Suspended 1/ }).length).toBeGreaterThan(0);
    });
});
