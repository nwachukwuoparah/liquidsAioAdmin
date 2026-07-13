import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Sidebar from "./sidebar";

vi.mock("next/navigation", () => ({
    usePathname: () => "/compliance",
}));

vi.mock("@/lib/admin/hooks/use-admin-nav-badge-counts", () => ({
    useAdminNavBadgeCounts: () => ({
        compliance: "42",
        rfqs: "99+",
        inventory: "99+",
    }),
}));

describe("Sidebar", () => {
    it("renders only on desktop", () => {
        const { container } = render(<Sidebar />);

        expect(container.querySelector("aside")?.className).toContain("hidden");
        expect(container.querySelector("aside")?.className).toContain("lg:flex");
    });

    it("shows live badge counts for compliance, rfqs, and inventory", () => {
        render(<Sidebar />);

        expect(screen.getByTestId("nav-badge-compliance")).toHaveTextContent("42");
        expect(screen.getByTestId("nav-badge-rfqs")).toHaveTextContent("99+");
        expect(screen.getByTestId("nav-badge-inventory")).toHaveTextContent("99+");
    });
});
