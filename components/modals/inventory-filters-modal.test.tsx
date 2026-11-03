import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InventoryFiltersModal from "./inventory-filters-modal";

vi.mock("@/components/form/form-filter-dropdown-field", () => ({
    FormFilterDropdownField: ({
        label,
        value,
        options,
        onChange,
        testId,
    }: {
        label: string;
        value: string;
        options: { value: string; label: string }[];
        onChange: (value: string) => void;
        testId?: string;
    }) => (
        <label>
            {label}
            <select
                data-testid={testId}
                aria-label={label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    ),
}));

describe("InventoryFiltersModal", () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    const onClose = vi.fn();

    beforeEach(() => {
        onApply.mockClear();
        onReset.mockClear();
        onClose.mockClear();
    });

    it("renders the backend-supported filter sections", () => {
        render(
            <InventoryFiltersModal
                initialParams={{}}
                onApply={onApply}
                onReset={onReset}
                onClose={onClose}
            />,
        );

        expect(screen.getByText("Filter")).toBeInTheDocument();
        expect(screen.queryByText("Seller status")).not.toBeInTheDocument();
        expect(screen.queryByText("Location")).not.toBeInTheDocument();
        expect(screen.getByText("Categories")).toBeInTheDocument();
        expect(screen.getByText("Condition")).toBeInTheDocument();
        expect(screen.getByText("Date posted")).toBeInTheDocument();
        expect(screen.getByText("Price range")).toBeInTheDocument();
        expect(screen.getByText("Lot status:")).toBeInTheDocument();
        expect(screen.getByText("All status")).toBeInTheDocument();
        expect(screen.getByText("Pending approval")).toBeInTheDocument();
        expect(screen.getByText("In review")).toBeInTheDocument();
        expect(screen.queryByText("Out-of-stock")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Reset all" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Apply filter" })).toBeInTheDocument();
    });

    it("applies draft selections as one filter object and closes", () => {
        render(
            <InventoryFiltersModal
                initialParams={{}}
                onApply={onApply}
                onReset={onReset}
                onClose={onClose}
            />,
        );

        fireEvent.change(screen.getByLabelText("Categories"), {
            target: { value: "Electronics" },
        });
        fireEvent.change(screen.getByLabelText("Condition"), {
            target: { value: "Refurbished" },
        });
        fireEvent.change(screen.getByLabelText("Price range"), {
            target: { value: "$0 - $500" },
        });
        fireEvent.click(screen.getByRole("button", { name: "In review" }));
        fireEvent.click(screen.getByRole("button", { name: "Apply filter" }));

        expect(onApply).toHaveBeenCalledTimes(1);
        expect(onApply.mock.calls[0][0]).toEqual({
            category: "elt",
            condition: "refurbished",
            priceRange: "$0 - $500",
            min_price: "0",
            max_price: "500",
            review_status: "in_review",
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("resets all filters and closes the modal", () => {
        render(
            <InventoryFiltersModal
                initialParams={{ category: "elt", condition: "refurbished" }}
                onApply={onApply}
                onReset={onReset}
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Reset all" }));

        expect(onReset).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onApply).not.toHaveBeenCalled();
    });
});
