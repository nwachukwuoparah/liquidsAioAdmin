import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DynamicFilters, { type FilterConfig } from "./dynamic-filters";

const filters: FilterConfig[] = [
    {
        id: "status",
        label: "Lot Status",
        defaultValue: "All statuses",
        options: ["All statuses", "Active", "Pending"],
    },
];

describe("DynamicFilters", () => {
    it("renders inactive filter label with standard typography styles", () => {
        render(
            <DynamicFilters
                filters={filters}
                selectedValues={{ status: "All statuses" }}
                onFilterChange={vi.fn()}
            />
        );

        const trigger = screen.getByRole("button", { name: /lot status/i });
        expect(trigger).toHaveTextContent("Lot Status");
    });

    it("opens a dropdown and selects a new value", () => {
        const onFilterChange = vi.fn();

        render(
            <DynamicFilters
                filters={filters}
                selectedValues={{ status: "All statuses" }}
                onFilterChange={onFilterChange}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /lot status/i }));
        fireEvent.click(screen.getByRole("button", { name: "Active" }));

        expect(onFilterChange).toHaveBeenCalledWith("status", "Active");
    });

    it("shows the selected value on an active filter trigger", () => {
        render(
            <DynamicFilters
                filters={filters}
                selectedValues={{ status: "Pending" }}
                onFilterChange={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /pending/i })).toHaveTextContent("Pending");
    });
});
