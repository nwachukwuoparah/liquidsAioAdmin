import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RfqsDetailsModal from "./rfqs-details-modal";
import type { AdminRfqApiRecord } from "@/lib/rfq/types/admin-rfqs-api.types";

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

vi.mock("@/app/(admin)/rfqs/page", () => ({
    getCategoryLabel: (category: string) => category,
}));

const sampleRfq: AdminRfqApiRecord = {
    id: "rfq-1",
    status: "pending",
    createdAt: "2026-07-01T12:00:00.000Z",
    resolvedAt: "",
    category: "Electronics",
    description: "Need electronics pallet",
    minPrice: 100,
    maxPrice: 500,
    user: {
        firstName: "John",
        lastName: "Peters",
    },
};

describe("RfqsDetailsModal", () => {
    beforeEach(() => {
        closeModalMock.mockClear();
        resolveMutate.mockReset();
        resolveMutate.mockImplementation((_rfqId, options) => options?.onSuccess?.());
    });

    it("shows mark as resolved for pending RFQs and resolves on click", () => {
        render(<RfqsDetailsModal details={sampleRfq} />);

        expect(screen.getByText("Request details")).toBeInTheDocument();
        expect(screen.getByText("$100 - $500")).toBeInTheDocument();
        expect(screen.getByText("Jul 1, 2026")).toBeInTheDocument();
        fireEvent.click(screen.getByTestId("rfq-details-mark-resolved"));

        expect(resolveMutate).toHaveBeenCalledWith("rfq-1", expect.any(Object));
        expect(closeModalMock).toHaveBeenCalledTimes(1);
    });

    it("hides mark as resolved for already resolved RFQs", () => {
        render(<RfqsDetailsModal details={{ ...sampleRfq, status: "resolved" }} />);

        expect(screen.queryByTestId("rfq-details-mark-resolved")).not.toBeInTheDocument();
    });
});
