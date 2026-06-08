import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RfqActionMenu from "./rfq-action-menu";

describe("RfqActionMenu", () => {
    it("opens the menu and renders both actions", () => {
        const onToggle = vi.fn();

        render(
            <RfqActionMenu isOpen={false} onToggle={onToggle} onClose={vi.fn()} />
        );

        fireEvent.click(screen.getByTestId("rfq-action-trigger"));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("shows view detail and mark as resolved when open", () => {
        render(
            <RfqActionMenu isOpen={true} onToggle={vi.fn()} onClose={vi.fn()} />
        );

        expect(screen.getByTestId("rfq-action-menu")).toBeInTheDocument();
        expect(screen.getByText("View detail")).toBeInTheDocument();
        expect(screen.getByText("Mark as resolved")).toBeInTheDocument();
    });

    it("closes when an action is clicked", () => {
        const onClose = vi.fn();

        render(
            <RfqActionMenu isOpen={true} onToggle={vi.fn()} onClose={onClose} />
        );

        fireEvent.click(screen.getByText("Mark as resolved"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
