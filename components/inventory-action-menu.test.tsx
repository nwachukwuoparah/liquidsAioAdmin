import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InventoryActionMenu from "./inventory-action-menu";

describe("InventoryActionMenu", () => {
    it("opens the menu with inventory actions and icons", () => {
        render(
            <InventoryActionMenu
                isOpen={false}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByTestId("inventory-action-trigger"));

        expect(screen.getByTestId("inventory-action-trigger")).toBeInTheDocument();
    });

    it("renders all menu actions when open", () => {
        render(
            <InventoryActionMenu
                isOpen={true}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText("View lot details")).toBeInTheDocument();
        expect(screen.getByText("Approve listing")).toBeInTheDocument();
        expect(screen.getByText("Decline listing")).toBeInTheDocument();
        expect(screen.getByText("Suspend")).toBeInTheDocument();
    });

    it("only colors the suspend icon", () => {
        const { container } = render(
            <InventoryActionMenu
                isOpen={true}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />
        );

        const coloredIcons = container.querySelectorAll('[class*="text-[#CC2929]"]');
        expect(coloredIcons).toHaveLength(1);
        expect(coloredIcons[0]?.tagName.toLowerCase()).toBe("svg");
    });
});
