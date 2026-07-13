import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RfqResolveModal from "./rfq-resolve-modal";

const closeModalMock = vi.fn();
const resolveMutate = vi.fn();

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        closeModal: closeModalMock,
        showModal: vi.fn(),
    }),
}));

vi.mock("@/lib/admin/hooks/use-admin-rfqs", () => ({
    useAdminRfqResolve: () => ({
        mutate: resolveMutate,
        isPending: false,
    }),
}));

describe("RfqResolveModal", () => {
    beforeEach(() => {
        closeModalMock.mockClear();
        resolveMutate.mockReset();
        resolveMutate.mockImplementation((_rfqId, options) => options?.onSuccess?.());
    });

    it("renders the confirmation copy with the buyer name", () => {
        render(<RfqResolveModal rfqId="rfq-1" buyerName="John Peters" />);

        expect(screen.getByText("Mark as resolved?")).toBeInTheDocument();
        expect(screen.getByText(/John Peters/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Yes, mark as resolved" })).toBeInTheDocument();
    });

    it("resolves the RFQ and closes on confirm", () => {
        render(<RfqResolveModal rfqId="rfq-1" buyerName="John Peters" />);

        fireEvent.click(screen.getByRole("button", { name: "Yes, mark as resolved" }));

        expect(resolveMutate).toHaveBeenCalledWith("rfq-1", expect.any(Object));
        expect(closeModalMock).toHaveBeenCalledTimes(1);
    });
});
