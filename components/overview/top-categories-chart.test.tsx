import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TopCategoriesChart from "./top-categories-chart";

describe("TopCategoriesChart", () => {
    it("renders all category legend labels", () => {
        render(<TopCategoriesChart />);

        expect(screen.getByText("Top categories by GMV")).toBeInTheDocument();
        expect(screen.getByTestId("top-categories-chart")).toBeInTheDocument();
        expect(screen.getByTestId("legend-Clothing")).toBeInTheDocument();
        expect(screen.getByTestId("legend-Electronics")).toBeInTheDocument();
        expect(screen.getByTestId("legend-Skin care")).toBeInTheDocument();
        expect(screen.getByTestId("legend-Farm product")).toBeInTheDocument();
        expect(screen.getByTestId("legend-Foods")).toBeInTheDocument();
        expect(screen.getByTestId("legend-Fashion")).toBeInTheDocument();
    });

    it("opens the period dropdown and selects a new period", () => {
        render(<TopCategoriesChart />);

        fireEvent.click(screen.getByTestId("category-period-trigger"));
        expect(screen.getByTestId("category-period-menu")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("category-period-last-month"));
        expect(screen.getByTestId("category-period-trigger")).toHaveTextContent("Last month");
    });
});
