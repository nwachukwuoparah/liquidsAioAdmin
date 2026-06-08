import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UserActionMenu from "./user-action-menu";

describe("UserActionMenu", () => {
    it("opens the menu when the trigger is clicked", () => {
        const onToggle = vi.fn();

        render(
            <UserActionMenu isOpen={false} onToggle={onToggle} onClose={vi.fn()} />
        );

        fireEvent.click(screen.getByTestId("user-action-trigger"));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("shows view profile and suspend account when open", () => {
        render(
            <UserActionMenu isOpen={true} onToggle={vi.fn()} onClose={vi.fn()} />
        );

        expect(screen.getByTestId("user-action-menu")).toBeInTheDocument();
        expect(screen.getByText("View profile")).toBeInTheDocument();
        expect(screen.getByText("Suspend account")).toBeInTheDocument();
    });

    it("closes when suspend account is clicked", () => {
        const onClose = vi.fn();

        render(
            <UserActionMenu isOpen={true} onToggle={vi.fn()} onClose={onClose} />
        );

        fireEvent.click(screen.getByText("Suspend account"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
