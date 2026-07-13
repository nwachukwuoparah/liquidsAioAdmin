import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InventoryDeclineListingModal from "./inventory-decline-listing-modal";

const closeModalMock = vi.fn();
const declineMutate = vi.fn();

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({ closeModal: closeModalMock, showModal: vi.fn() }),
}));

vi.mock("@/lib/inventory/hooks/use-admin-inventory-review", () => ({
    useAdminInventoryLotDecline: () => ({ mutate: declineMutate, isPending: false }),
}));

describe("InventoryDeclineListingModal", () => {
    beforeEach(() => {
        closeModalMock.mockClear();
        declineMutate.mockReset();
        declineMutate.mockImplementation((_body, options) => options?.onSuccess?.());
    });

    it("renders the decline copy with the lot title and disables submit until a reason is entered", () => {
        render(<InventoryDeclineListingModal lotId="lot-1" lotTitle="Mixed Electronics Pallet" />);

        expect(screen.getByText("Decline this listing?")).toBeInTheDocument();
        expect(screen.getByText(/Mixed Electronics Pallet/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Yes, Decline listing" })).toBeDisabled();
    });

    it("declines the listing with the entered reason", async () => {
        render(<InventoryDeclineListingModal lotId="lot-1" lotTitle="Mixed Electronics Pallet" />);

        fireEvent.change(screen.getByLabelText("Add a note/reason"), {
            target: { value: "The description is inconsistent. Please review & resubmit." },
        });

        const submitButton = screen.getByRole("button", { name: "Yes, Decline listing" });
        await vi.waitFor(() => expect(submitButton).toBeEnabled());

        fireEvent.click(submitButton);

        await vi.waitFor(() => expect(declineMutate).toHaveBeenCalledTimes(1));
        expect(declineMutate.mock.calls[0][0]).toEqual({
            lotId: "lot-1",
            action: "reject",
            rejectionReason: "The description is inconsistent. Please review & resubmit.",
        });
        expect(closeModalMock).toHaveBeenCalledTimes(1);
    });
});
