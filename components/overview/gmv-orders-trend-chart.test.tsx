import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GmvOrdersTrendChart from "./gmv-orders-trend-chart";

describe("GmvOrdersTrendChart", () => {
    it("renders the chart container and default range", () => {
        render(<GmvOrdersTrendChart />);

        expect(screen.getByText("GMV vs Orders trend")).toBeInTheDocument();
        expect(screen.getByTestId("gmv-orders-chart")).toBeInTheDocument();
        expect(screen.getByTestId("trend-range-30D")).toHaveStyle({ backgroundColor: "#B1EC52" });
    });

    it("updates active toggle when a different range is selected", () => {
        render(<GmvOrdersTrendChart />);

        fireEvent.click(screen.getByTestId("trend-range-7D"));

        expect(screen.getByTestId("trend-range-7D")).toHaveStyle({ backgroundColor: "#B1EC52" });
        expect(screen.getByTestId("trend-range-30D")).not.toHaveStyle({ backgroundColor: "#B1EC52" });

        fireEvent.click(screen.getByTestId("trend-range-1D"));

        expect(screen.getByTestId("trend-range-1D")).toHaveStyle({ backgroundColor: "#B1EC52" });
        expect(screen.getByTestId("trend-range-7D")).not.toHaveStyle({ backgroundColor: "#B1EC52" });
    });

    it("highlights a date when an x-axis day is clicked", () => {
        render(<GmvOrdersTrendChart />);

        const aug30 = screen.getByTestId("trend-date-aug-30");
        fireEvent.click(aug30);

        expect(aug30).toHaveStyle({ backgroundColor: "#B1EC52" });
    });
});
