import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ComplianceFilters, { COMPLIANCE_FILTER_BLUEPRINTS } from "./compliance-filters";

const defaultSelectedValues = {
    accountType: "All account types",
    reviewStatus: "All statuses",
    dateRange: "All time",
    assignedTo: "Everyone",
};

describe("ComplianceFilters", () => {
    it("opens a filter dropdown and selects a new value", () => {
        const onFilterChange = vi.fn();

        render(
            <ComplianceFilters
                searchQuery=""
                onSearchChange={vi.fn()}
                filters={COMPLIANCE_FILTER_BLUEPRINTS}
                selectedValues={defaultSelectedValues}
                onFilterChange={onFilterChange}
            />
        );

        fireEvent.click(screen.getByTestId("compliance-filter-accountType"));
        expect(screen.getByTestId("compliance-filter-menu-accountType")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("compliance-filter-option-accountType-buyer"));
        expect(onFilterChange).toHaveBeenCalledWith("accountType", "Buyer");
    });

    it("updates the search input", () => {
        const onSearchChange = vi.fn();

        render(
            <ComplianceFilters
                searchQuery=""
                onSearchChange={onSearchChange}
                filters={COMPLIANCE_FILTER_BLUEPRINTS}
                selectedValues={defaultSelectedValues}
                onFilterChange={vi.fn()}
            />
        );

        fireEvent.change(screen.getByTestId("compliance-search-input"), {
            target: { value: "Mary" },
        });

        expect(onSearchChange).toHaveBeenCalledWith("Mary");
    });

    it("shows the selected value on an active filter trigger", () => {
        render(
            <ComplianceFilters
                searchQuery=""
                onSearchChange={vi.fn()}
                filters={COMPLIANCE_FILTER_BLUEPRINTS}
                selectedValues={{
                    ...defaultSelectedValues,
                    reviewStatus: "In Review",
                }}
                onFilterChange={vi.fn()}
            />
        );

        expect(screen.getByTestId("compliance-filter-reviewStatus")).toHaveTextContent("In Review");
    });
});
