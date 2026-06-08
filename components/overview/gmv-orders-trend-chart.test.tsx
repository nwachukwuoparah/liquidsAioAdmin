import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import GmvOrdersTrendChart from "./gmv-orders-trend-chart";

vi.mock("recharts", async () => {
    const actual = await vi.importActual<typeof import("recharts")>("recharts");

    return {
        ...actual,
        ResponsiveContainer: ({ children }: { children: ReactNode }) => (
            <div style={{ width: 400, height: 300 }}>{children}</div>
        ),
    };
});

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

    it("renders chart legend labels", () => {
        render(<GmvOrdersTrendChart />);

        expect(screen.getByText("GMV")).toBeInTheDocument();
        expect(screen.getByText("Orders")).toBeInTheDocument();
    });
});
