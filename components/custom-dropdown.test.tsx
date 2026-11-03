import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomDropdown } from "./custom-dropdown";

describe("CustomDropdown custom date range", () => {
    it("lets users apply a custom start and end date", () => {
        const onChange = vi.fn();

        render(
            <CustomDropdown
                value="All time"
                defaultValue="All time"
                filterLabel="Date range"
                options={[
                    { value: "All time", label: "All time" },
                    { value: "Today", label: "Today" },
                    { value: "Custom range", label: "Custom range" },
                ]}
                onChange={onChange}
                optionTestIdPrefix="date-filter"
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /date range/i }));
        fireEvent.click(screen.getByRole("option", { name: "Custom range" }));

        expect(screen.getByTestId("date-filter-custom-range-panel")).toBeInTheDocument();

        fireEvent.change(screen.getByTestId("date-filter-custom-start"), {
            target: { value: "2026-01-01" },
        });
        fireEvent.change(screen.getByTestId("date-filter-custom-end"), {
            target: { value: "2026-01-31" },
        });
        fireEvent.click(screen.getByTestId("date-filter-custom-apply"));

        expect(onChange).toHaveBeenCalledWith("custom:2026-01-01:2026-01-31");
    });

    it("shows the formatted custom range on the trigger", () => {
        render(
            <CustomDropdown
                value="custom:2026-01-01:2026-01-31"
                defaultValue="All time"
                filterLabel="Date range"
                options={[
                    { value: "All time", label: "All time" },
                    { value: "Custom range", label: "Custom range" },
                ]}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("button", { name: /jan 1, 2026 – jan 31, 2026/i })).toHaveTextContent(
            "Jan 1, 2026 – Jan 31, 2026",
        );
    });

    it("lets users apply a custom start and end price", () => {
        const onChange = vi.fn();

        render(
            <CustomDropdown
                value="All prices"
                defaultValue="All prices"
                filterLabel="Price range"
                customRangeKind="price"
                options={[
                    { value: "All prices", label: "All prices" },
                    { value: "$0 - $500", label: "$0 - $500" },
                    { value: "Custom range", label: "Custom range" },
                ]}
                onChange={onChange}
                optionTestIdPrefix="price-filter"
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /price range/i }));
        fireEvent.click(screen.getByRole("option", { name: "Custom range" }));

        expect(screen.getByTestId("price-filter-custom-range-panel")).toBeInTheDocument();

        fireEvent.change(screen.getByTestId("price-filter-custom-min-price"), {
            target: { value: "120" },
        });
        fireEvent.change(screen.getByTestId("price-filter-custom-max-price"), {
            target: { value: "850" },
        });
        fireEvent.click(screen.getByTestId("price-filter-custom-apply"));

        expect(onChange).toHaveBeenCalledWith("price:120:850");
    });
});
