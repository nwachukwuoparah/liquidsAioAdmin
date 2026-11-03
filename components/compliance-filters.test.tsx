import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ComplianceFilters, { COMPLIANCE_FILTER_BLUEPRINTS } from "./compliance-filters";

const defaultSelectedValues = {
    account_type: undefined,
    compliance_review_status: undefined,
    dateRange: undefined,
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

        fireEvent.click(screen.getByTestId("compliance-filter-account_type"));
        expect(screen.getByTestId("compliance-filter-menu-account_type")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("compliance-filter-option-account_type-buyer"));
        expect(onFilterChange).toHaveBeenCalledWith("account_type", "Buyer");
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
            target: { value: "mary@buyer.com" },
        });

        expect(onSearchChange).toHaveBeenCalledWith("mary@buyer.com");
    });

    it("shows the selected value on an active filter trigger", () => {
        render(
            <ComplianceFilters
                searchQuery=""
                onSearchChange={vi.fn()}
                filters={COMPLIANCE_FILTER_BLUEPRINTS}
                selectedValues={{
                    ...defaultSelectedValues,
                    compliance_review_status: "In review",
                }}
                onFilterChange={vi.fn()}
            />
        );

        expect(screen.getByTestId("compliance-filter-compliance_review_status")).toHaveTextContent("In review");
    });

    it("opens the custom date panel and applies custom date range", () => {
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

        fireEvent.click(screen.getByTestId("compliance-filter-dateRange"));
        expect(screen.getByTestId("compliance-filter-menu-dateRange")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("compliance-filter-option-dateRange-custom-date"));

        const startInput = screen.getByTestId("compliance-filter-option-dateRange-custom-start");
        const endInput = screen.getByTestId("compliance-filter-option-dateRange-custom-end");
        const applyBtn = screen.getByTestId("compliance-filter-option-dateRange-custom-apply");

        fireEvent.change(startInput, { target: { value: "2026-06-01" } });
        fireEvent.change(endInput, { target: { value: "2026-06-18" } });
        fireEvent.click(applyBtn);

        expect(onFilterChange).toHaveBeenCalledWith("dateRange", "custom:2026-06-01:2026-06-18");
    });
});
