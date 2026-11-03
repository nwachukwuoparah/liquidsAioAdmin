import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UserFiltersModal from "./user-filters-modal";

describe("UserFiltersModal", () => {
    it("renders compliance, account status, and joined date controls without location", () => {
        render(
            <UserFiltersModal
                initialParams={{}}
                onApply={vi.fn()}
                onReset={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByText("Filter users")).toBeInTheDocument();
        expect(screen.getByText("Compliance status")).toBeInTheDocument();
        expect(screen.getByText("Account status")).toBeInTheDocument();
        expect(screen.getByText("Joined date")).toBeInTheDocument();
        expect(screen.queryByText("Location")).not.toBeInTheDocument();
    });

    it("allows selecting account status chip and applying", () => {
        const onApply = vi.fn();
        const onClose = vi.fn();

        render(
            <UserFiltersModal
                initialParams={{}}
                onApply={onApply}
                onReset={vi.fn()}
                onClose={onClose}
            />,
        );

        const suspendedBtn = screen.getByRole("button", { name: "Suspended" });
        fireEvent.click(suspendedBtn);

        const applyBtn = screen.getByRole("button", { name: "Apply filter" });
        fireEvent.click(applyBtn);

        expect(onApply).toHaveBeenCalledWith(
            expect.objectContaining({
                accountStatus: "Suspended",
            }),
        );
        expect(onClose).toHaveBeenCalled();
    });

    it("triggers onReset and onClose when Reset all is clicked", () => {
        const onReset = vi.fn();
        const onClose = vi.fn();

        render(
            <UserFiltersModal
                initialParams={{ accountStatus: "Active" }}
                onApply={vi.fn()}
                onReset={onReset}
                onClose={onClose}
            />,
        );

        const resetBtn = screen.getByRole("button", { name: "Reset all" });
        fireEvent.click(resetBtn);

        expect(onReset).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});
