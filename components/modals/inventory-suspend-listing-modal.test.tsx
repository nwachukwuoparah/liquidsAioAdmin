import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InventorySuspendListingModal from "./inventory-suspend-listing-modal";

const closeModalMock = vi.fn();
const suspendMutate = vi.fn();

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({ closeModal: closeModalMock, showModal: vi.fn() }),
}));

vi.mock("@/lib/inventory/hooks/use-admin-inventory-review", () => ({
    useAdminInventoryLotSuspend: () => ({ mutate: suspendMutate, isPending: false }),
}));

vi.mock("@/components/custom-dropdown", () => ({
    CustomDropdown: ({
        value,
        options,
        onChange,
        testId,
    }: {
        value: string;
        options: { value: string; label: string }[];
        onChange: (value: string) => void;
        testId?: string;
    }) => (
        <select
            data-testid={testId}
            aria-label="Select reason"
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));

describe("InventorySuspendListingModal", () => {
    beforeEach(() => {
        closeModalMock.mockClear();
        suspendMutate.mockReset();
        suspendMutate.mockImplementation((_body, options) => options?.onSuccess?.());
    });

    it("renders the confirmation copy with the lot title and disables submit initially", () => {
        render(<InventorySuspendListingModal lotId="lot-1" lotTitle="Mixed Electronics Pallet" />);

        expect(screen.getByText("Suspend this listing?")).toBeInTheDocument();
        expect(screen.getByText(/Mixed Electronics Pallet/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Suspend listing" })).toBeDisabled();
        expect(screen.queryByLabelText("Add a note/reason")).not.toBeInTheDocument();
    });

    it("suspends with the selected reason when a listed reason is chosen", async () => {
        render(<InventorySuspendListingModal lotId="lot-1" lotTitle="Mixed Electronics Pallet" />);

        fireEvent.change(screen.getByLabelText("Select reason"), {
            target: { value: "prohibited_item" },
        });

        const submitButton = screen.getByRole("button", { name: "Suspend listing" });
        await vi.waitFor(() => expect(submitButton).toBeEnabled());

        fireEvent.click(submitButton);

        await vi.waitFor(() => expect(suspendMutate).toHaveBeenCalledTimes(1));
        expect(suspendMutate.mock.calls[0][0]).toEqual({
            lotId: "lot-1",
            action: "suspend",
            suspensionReason: "prohibited_item",
            note: undefined,
        });
        expect(closeModalMock).toHaveBeenCalledTimes(1);
    });

    it("requires a note when the Other reason is selected", async () => {
        render(<InventorySuspendListingModal lotId="lot-1" />);

        fireEvent.change(screen.getByLabelText("Select reason"), {
            target: { value: "other" },
        });

        const noteField = await screen.findByLabelText("Add a note/reason");
        const submitButton = screen.getByRole("button", { name: "Suspend listing" });
        expect(submitButton).toBeDisabled();

        fireEvent.change(noteField, { target: { value: "Too many counterfeit reports" } });
        await vi.waitFor(() => expect(submitButton).toBeEnabled());

        fireEvent.click(submitButton);

        await vi.waitFor(() => expect(suspendMutate).toHaveBeenCalledTimes(1));
        expect(suspendMutate.mock.calls[0][0]).toEqual({
            lotId: "lot-1",
            action: "suspend",
            suspensionReason: "other",
            note: "Too many counterfeit reports",
        });
    });
});
