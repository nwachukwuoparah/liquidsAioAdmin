import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RfqActionMenu from "./rfq-action-menu";
import RfqResolveModal from "./modals/rfq-resolve-modal";
import RfqsDetailsModal from "./modals/rfqs-details-modal";
import type { AdminRfqApiRecord } from "@/lib/rfq/types/admin-rfqs-api.types";

const { showModalMock } = vi.hoisted(() => ({
    showModalMock: vi.fn(),
}));

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: showModalMock,
        closeModal: vi.fn(),
    }),
}));

const sampleRfq: AdminRfqApiRecord = {
    id: "rfq-1",
    status: "pending",
    createdAt: "2026-07-01T12:00:00.000Z",
    resolvedAt: "",
    category: "elt",
    description: "Need electronics pallet",
    minPrice: 100,
    maxPrice: 500,
    user: {
        firstName: "John",
        lastName: "Peters",
    },
};

describe("RfqActionMenu", () => {
    beforeEach(() => {
        showModalMock.mockClear();
    });

    it("opens the menu and renders both actions for pending RFQs", () => {
        const onToggle = vi.fn();

        render(
            <RfqActionMenu
                details={sampleRfq}
                isOpen={false}
                onToggle={onToggle}
                onClose={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId("rfq-action-trigger"));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("shows view detail and mark as resolved when open", () => {
        render(
            <RfqActionMenu
                details={sampleRfq}
                isOpen={true}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByTestId("rfq-action-menu")).toBeInTheDocument();
        expect(screen.getByText("View detail")).toBeInTheDocument();
        expect(screen.getByText("Mark as resolved")).toBeInTheDocument();
    });

    it("hides mark as resolved for already resolved RFQs", () => {
        render(
            <RfqActionMenu
                details={{ ...sampleRfq, status: "resolved" }}
                isOpen={true}
                onToggle={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByText("View detail")).toBeInTheDocument();
        expect(screen.queryByText("Mark as resolved")).not.toBeInTheDocument();
    });

    it("opens the details modal from view detail", () => {
        const onClose = vi.fn();

        render(
            <RfqActionMenu
                details={sampleRfq}
                isOpen={true}
                onToggle={vi.fn()}
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByText("View detail"));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(showModalMock).toHaveBeenCalledTimes(1);
        const modalPayload = showModalMock.mock.calls[0][0];
        expect(typeof modalPayload.content).toBe("function");
        const content = modalPayload.content();
        expect(content.type).toBe(RfqsDetailsModal);
        expect(content.props.details.id).toBe("rfq-1");
    });

    it("opens the resolve confirmation modal from mark as resolved", () => {
        const onClose = vi.fn();

        render(
            <RfqActionMenu
                details={sampleRfq}
                isOpen={true}
                onToggle={vi.fn()}
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByTestId("rfq-mark-resolved"));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(showModalMock).toHaveBeenCalledTimes(1);
        const modalPayload = showModalMock.mock.calls[0][0];
        expect(modalPayload.content.type).toBe(RfqResolveModal);
        expect(modalPayload.content.props.rfqId).toBe("rfq-1");
        expect(modalPayload.content.props.buyerName).toBe("John Peters");
    });
});
