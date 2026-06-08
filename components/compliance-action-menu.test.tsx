import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ComplianceActionMenu from "./compliance-action-menu";

describe("ComplianceActionMenu", () => {
    it("opens the menu and renders all action items", () => {
        const onToggle = vi.fn();
        const onClose = vi.fn();

        render(
            <ComplianceActionMenu isOpen={false} onToggle={onToggle} onClose={onClose} />
        );

        fireEvent.click(screen.getByTestId("compliance-action-trigger"));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("shows all four actions when open", () => {
        render(
            <ComplianceActionMenu isOpen={true} onToggle={vi.fn()} onClose={vi.fn()} />
        );

        expect(screen.getByTestId("compliance-action-menu")).toBeInTheDocument();
        expect(screen.getByText("View detail")).toBeInTheDocument();
        expect(screen.getByText("Request update")).toBeInTheDocument();
        expect(screen.getByText("Approve")).toBeInTheDocument();
        expect(screen.getByText("Reject")).toBeInTheDocument();
    });

    it("closes when an action is clicked", () => {
        const onClose = vi.fn();

        render(
            <ComplianceActionMenu isOpen={true} onToggle={vi.fn()} onClose={onClose} />
        );

        fireEvent.click(screen.getByText("Reject"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
