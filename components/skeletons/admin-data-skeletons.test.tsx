import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
    AdminAsyncContent,
    ChartPanelSkeleton,
    DataTableSkeleton,
    FormSectionSkeleton,
    GeneralSettingsSkeleton,
    ListRowsSkeleton,
    MetricCardsSkeleton,
    ProfileSettingsSkeleton,
    StatCardsSkeleton,
    TableRowsSkeleton,
} from "./admin-data-skeletons";

describe("StatCardsSkeleton", () => {
    it("renders the requested number of stat placeholders", () => {
        render(<StatCardsSkeleton count={3} />);

        expect(screen.getByTestId("stat-cards-skeleton").children).toHaveLength(3);
    });
});

describe("MetricCardsSkeleton", () => {
    it("renders metric card placeholders", () => {
        render(<MetricCardsSkeleton count={2} />);

        expect(screen.getByTestId("metric-cards-skeleton").children).toHaveLength(2);
    });

    it("applies optional spacing className", () => {
        render(<MetricCardsSkeleton count={2} className="my-6" />);

        expect(screen.getByTestId("metric-cards-skeleton").className).toContain("my-6");
    });
});

describe("ChartPanelSkeleton", () => {
    it("renders chart panel placeholders", () => {
        render(<ChartPanelSkeleton />);

        expect(screen.getByTestId("chart-panel-skeleton")).toBeInTheDocument();
    });
});

describe("DataTableSkeleton", () => {
    it("renders spaced row placeholders", () => {
        render(<DataTableSkeleton rows={3} columns={4} />);

        const skeleton = screen.getByTestId("data-table-skeleton");
        expect(skeleton.className).toContain("space-y-4");
        expect(skeleton.children.length).toBeGreaterThanOrEqual(3);
    });
});

describe("TableRowsSkeleton", () => {
    it("renders table row placeholders with cell padding", () => {
        render(
            <table>
                <tbody>
                    <TableRowsSkeleton rows={3} columns={4} />
                </tbody>
            </table>,
        );

        const rows = screen.getAllByTestId("table-row-skeleton");
        expect(rows).toHaveLength(3);
        expect(rows[0].querySelectorAll("td")).toHaveLength(4);
        expect(rows[0].querySelector("td")?.className).toContain("py-4");
    });
});

describe("ListRowsSkeleton", () => {
    it("renders list row placeholders", () => {
        render(<ListRowsSkeleton rows={4} />);

        expect(screen.getByTestId("list-rows-skeleton").children).toHaveLength(4);
    });
});

describe("FormSectionSkeleton", () => {
    it("renders form field placeholders", () => {
        render(<FormSectionSkeleton fields={2} />);

        expect(screen.getByTestId("form-section-skeleton").children).toHaveLength(2);
    });
});

describe("ProfileSettingsSkeleton", () => {
    it("renders a shape-matched profile settings loading state", () => {
        const { container } = render(<ProfileSettingsSkeleton />);

        expect(screen.getByTestId("profile-settings-skeleton")).toBeInTheDocument();
        expect(container.querySelector(".rounded-full")).toBeInTheDocument();
        expect(container.querySelectorAll(".rounded-xl").length).toBeGreaterThanOrEqual(3);
    });
});

describe("GeneralSettingsSkeleton", () => {
    it("renders a shape-matched general settings loading state", () => {
        render(<GeneralSettingsSkeleton />);

        expect(screen.getByTestId("general-settings-skeleton")).toBeInTheDocument();
        expect(screen.getByTestId("general-settings-skeleton").children).toHaveLength(2);
    });
});

describe("AdminAsyncContent", () => {
    it("shows the loading fallback while data is loading", () => {
        render(
            <AdminAsyncContent
                isLoading
                loadingFallback={<div>Loading...</div>}
                emptyFallback={<div>Empty</div>}
            >
                <div>Content</div>
            </AdminAsyncContent>,
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("shows the empty fallback when the list is empty", () => {
        render(
            <AdminAsyncContent
                isLoading={false}
                isEmpty
                loadingFallback={<div>Loading...</div>}
                emptyFallback={<div>Empty</div>}
            >
                <div>Content</div>
            </AdminAsyncContent>,
        );

        expect(screen.getByText("Empty")).toBeInTheDocument();
    });

    it("renders children when data is ready", () => {
        render(
            <AdminAsyncContent
                isLoading={false}
                isEmpty={false}
                loadingFallback={<div>Loading...</div>}
                emptyFallback={<div>Empty</div>}
            >
                <div>Content</div>
            </AdminAsyncContent>,
        );

        expect(screen.getByText("Content")).toBeInTheDocument();
    });
});
