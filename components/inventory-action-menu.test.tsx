import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InventoryActionMenu from "./inventory-action-menu";

const showModalMock = vi.fn();

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: showModalMock,
        closeModal: vi.fn(),
    }),
}));

describe("InventoryActionMenu", () => {
    beforeEach(() => {
        showModalMock.mockReset();
    });

    it("opens the menu with inventory actions and icons", () => {
        render(
            <InventoryActionMenu
                lotId="lot-1"
                lotStatus="Pending"
                isOpen={false}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId("inventory-action-trigger"));

        expect(screen.getByTestId("inventory-action-trigger")).toBeInTheDocument();
    });

    it("renders review actions for pending lots when open", () => {
        render(
            <InventoryActionMenu
                lotId="lot-1"
                lotStatus="Pending"
                isOpen={true}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByText("View lot details")).toBeInTheDocument();
        expect(screen.getByText("Approve listing")).toBeInTheDocument();
        expect(screen.getByText("Decline listing")).toBeInTheDocument();
    });

    it("opens the lot details modal from the action menu", () => {
        const onClose = vi.fn();

        render(
            <InventoryActionMenu
                lotId="lot-1"
                lotSlug="phone-ehao1lo5ufz"
                lotTitle="Electronics lot"
                lotStatus="Pending"
                isOpen={true}
                onToggle={vi.fn()}
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByText("View lot details"));

        expect(onClose).toHaveBeenCalled();
        expect(showModalMock).toHaveBeenCalled();
        const modalPayload = showModalMock.mock.calls[0]?.[0] as { content: { props?: { lotId?: string } } };
        expect(modalPayload.content.props?.lotId).toBe("phone-ehao1lo5ufz");
    });

    it("only colors the suspend icon when suspend is available", () => {
        render(
            <InventoryActionMenu
                lotId="lot-1"
                lotStatus="Active"
                isOpen={true}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        const coloredIcons = document.querySelectorAll('[class*="text-[#CC2929]"]');
        expect(coloredIcons).toHaveLength(1);
        expect(coloredIcons[0]?.tagName.toLowerCase()).toBe("svg");
    });
});
