import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComplianceActionMenu from "./compliance-action-menu";

const showModalMock = vi.fn();

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: showModalMock,
        closeModal: vi.fn(),
    }),
}));

describe("ComplianceActionMenu", () => {
    beforeEach(() => {
        showModalMock.mockReset();
    });

    it("opens the menu and renders all action items", () => {
        const onToggle = vi.fn();

        render(
            <ComplianceActionMenu
                userId="review-1"
                accountType="Buyer"
                isOpen={false}
                onToggle={onToggle}
                onClose={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId("compliance-action-trigger"));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("shows view, approve, and reject actions when open", () => {
        render(
            <ComplianceActionMenu
                userId="review-1"
                accountType="Buyer"
                isOpen={true}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByTestId("compliance-action-menu")).toBeInTheDocument();
        expect(screen.getByText("View detail")).toBeInTheDocument();
        expect(screen.queryByText("Request update")).not.toBeInTheDocument();
        expect(screen.getByText("Approve")).toBeInTheDocument();
        expect(screen.getByText("Reject")).toBeInTheDocument();
    });

    it("opens the compliance details modal from view detail", () => {
        const onClose = vi.fn();

        render(
            <ComplianceActionMenu
                userId="review-1"
                accountType="Buyer"
                isOpen={true}
                onToggle={vi.fn()}
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByText("View detail"));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(showModalMock).toHaveBeenCalledTimes(1);
    });

    it("opens the reject review modal from the menu", () => {
        const onClose = vi.fn();

        render(
            <ComplianceActionMenu
                userId="review-1"
                accountType="Buyer"
                isOpen={true}
                onToggle={vi.fn()}
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByText("Reject"));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(showModalMock).toHaveBeenCalledTimes(1);
    });
});
