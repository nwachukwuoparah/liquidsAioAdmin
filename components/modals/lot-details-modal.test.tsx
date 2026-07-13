import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LotDetailsModal, { orNone } from "./lot-details-modal";
import LotImagesModal from "./lot-images-modal";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";

const { showModalMock } = vi.hoisted(() => ({ showModalMock: vi.fn() }));
const { detailRef } = vi.hoisted(() => ({ detailRef: { current: null as unknown } }));

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        closeModal: vi.fn(),
        showModal: showModalMock,
    }),
}));

const sampleDetail = {
    id: "lot-1",
    title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers",
    description:
        "High-quality consumer electronics including smartphones, tablet, headphones, and accessories. Perfect for retail resale or wholesale distribution",
    status: "Pending",
    reviewStatus: "pending",
    category: "Electronics",
    condition: "New",
    skuType: "single_sku",
    unitQuantity: 30,
    pricePerUnit: 75,
    totalPrice: 2250,
    minimumOrderQuantity: 10,
    shippingFrom: "Dallas, TX 75240",
    shippingTerms: "Buyer arranged shipping",
    shippingFeeEstimate: "???",
    createdAt: "2026-07-07T10:00:00.000Z",
    updatedAt: "2026-07-08T13:00:00.000Z",
    views: 507,
    offers: 13,
    totalOrders: 2,
    listingUrl: "https://liquidsaio.com/lots/mixed-electronics",
    reported: false,
    images: [
        { url: "https://example.com/lot-1.jpg" },
        { url: "https://example.com/lot-2.jpg" },
        { url: "https://example.com/lot-3.jpg" },
        { url: "https://example.com/lot-4.jpg" },
        { url: "https://example.com/lot-5.jpg" },
        { url: "https://example.com/lot-6.jpg" },
        { url: "https://example.com/lot-7.jpg" },
    ],
    seller: {
        name: "John Peters",
        email: "johnpeters@email.com",
        phone: "+1 (555) 123-4567",
        rating: 4.8,
        accountHealth: 99,
        responseTime: "< 2 hours",
        activeListings: 47,
        joinedAt: "2024-01-15T00:00:00.000Z",
        location: "123 Business Ave, New York, NY 10001",
    },
};

vi.mock("@/lib/inventory/hooks/use-admin-inventory-review", () => ({
    useAdminInventoryLotDetail: () => ({
        data: detailRef.current,
        isLoading: false,
        isError: false,
    }),
    useAdminInventoryLotApprove: () => ({ mutate: vi.fn(), isPending: false }),
    useAdminInventoryLotDecline: () => ({ mutate: vi.fn(), isPending: false }),
    useAdminInventoryLotSuspend: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe("LotDetailsModal", () => {
    beforeEach(() => {
        showModalMock.mockClear();
        detailRef.current = sampleDetail;
    });

    it("replicates the designed lot details sections and actions", () => {
        renderWithQueryClient(<LotDetailsModal lotId="lot-1" />);

        expect(screen.getByText("Lot details:")).toBeInTheDocument();
        expect(screen.getAllByText("View listing").length).toBeGreaterThan(0);
        expect(screen.getByText(sampleDetail.title)).toBeInTheDocument();
        expect(screen.getByText(/High-quality consumer electronics/i)).toBeInTheDocument();
        expect(screen.getByText("Status: Pending")).toBeInTheDocument();

        expect(screen.getByText("Product details:")).toBeInTheDocument();
        expect(screen.getByText("Category")).toBeInTheDocument();
        expect(screen.getByText("Conditions")).toBeInTheDocument();
        expect(screen.getByText("SKU type")).toBeInTheDocument();
        expect(screen.getByText("Boxes")).toBeInTheDocument();
        expect(screen.getByText("For each")).toBeInTheDocument();
        expect(screen.getByText("Total")).toBeInTheDocument();

        expect(screen.getByText("Order details:")).toBeInTheDocument();
        expect(screen.getByText("Other details:")).toBeInTheDocument();
        expect(screen.getByText("Views")).toBeInTheDocument();
        expect(screen.getByText("Offers")).toBeInTheDocument();
        expect(screen.getByText("Total orders")).toBeInTheDocument();

        expect(screen.getByText("Seller details:")).toBeInTheDocument();
        expect(screen.getByText("John Peters")).toBeInTheDocument();
        expect(screen.getByText("SELLER ACCOUNT")).toBeInTheDocument();
        expect(screen.getByText("Email:")).toBeInTheDocument();
        expect(screen.getByText("Seller rating:")).toBeInTheDocument();

        expect(screen.getByText("Approve listing")).toBeInTheDocument();
        expect(screen.getByText("Decline listing")).toBeInTheDocument();
    });

    it("renders a responsive 3+2 image gallery with equal-width bottom tiles", () => {
        renderWithQueryClient(<LotDetailsModal lotId="lot-1" />);

        const tiles = screen.getAllByTestId("lot-image-tile");
        expect(tiles).toHaveLength(5);
        expect(tiles[3]).toHaveClass("aspect-[16/10]");
        expect(tiles[4]).toHaveClass("aspect-[16/10]");

        expect(screen.queryByTestId("lot-image-delete")).not.toBeInTheDocument();
        expect(screen.getByTestId("lot-image-overflow")).toHaveClass("bg-[#FFFFFF]");
        expect(screen.getByText("+3 images")).toBeInTheDocument();
    });

    it("opens the all-images viewer when the overflow tile is clicked", () => {
        renderWithQueryClient(<LotDetailsModal lotId="lot-1" />);

        fireEvent.click(screen.getByTestId("lot-image-overflow"));

        expect(showModalMock).toHaveBeenCalledTimes(1);
        const modalPayload = showModalMock.mock.calls[0][0];
        expect(modalPayload.content.type).toBe(LotImagesModal);
        expect(modalPayload.content.props.images).toHaveLength(sampleDetail.images.length);
        expect(modalPayload.content.props.initialIndex).toBe(4);
    });

    it("renders friendly 'No ...' fallbacks for missing fields", () => {
        detailRef.current = {
            ...sampleDetail,
            shippingFrom: "—",
            shippingTerms: "",
            shippingFeeEstimate: "—",
            minimumOrderQuantity: 0,
            seller: {
                ...sampleDetail.seller,
                name: "—",
                email: "—",
                phone: "—",
                rating: null,
                accountHealth: null,
                responseTime: "—",
                activeListings: null,
                joinedAt: undefined,
                location: "—",
            },
        };

        renderWithQueryClient(<LotDetailsModal lotId="lot-1" />);

        expect(screen.getByText("No minimum order")).toBeInTheDocument();
        expect(screen.getByText("No shipping address")).toBeInTheDocument();
        expect(screen.getByText("No shipping terms")).toBeInTheDocument();
        expect(screen.getByText("No shipping fee estimate")).toBeInTheDocument();

        expect(screen.getByText("No seller name")).toBeInTheDocument();
        expect(screen.getByText("No phone number")).toBeInTheDocument();
        expect(screen.getByText("No email address")).toBeInTheDocument();
        expect(screen.getByText("No rating")).toBeInTheDocument();
        expect(screen.getByText("No health score")).toBeInTheDocument();
        expect(screen.getByText("No response time")).toBeInTheDocument();
        expect(screen.getByText("No active listings")).toBeInTheDocument();
        expect(screen.getByText("No join date")).toBeInTheDocument();
        expect(screen.getByText("No location")).toBeInTheDocument();
    });
});

describe("orNone", () => {
    it("returns the value when it is present", () => {
        expect(orNone("Dallas, TX", "No shipping address")).toBe("Dallas, TX");
        expect(orNone(0, "No value")).toBe(0);
        expect(orNone(42, "No value")).toBe(42);
    });

    it("returns the fallback for null, undefined, empty, or dash values", () => {
        expect(orNone(null, "No rating")).toBe("No rating");
        expect(orNone(undefined, "No rating")).toBe("No rating");
        expect(orNone("", "No location")).toBe("No location");
        expect(orNone("   ", "No location")).toBe("No location");
        expect(orNone("—", "No location")).toBe("No location");
    });
});
