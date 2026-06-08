import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BottomNav from "./bottom-nav";

vi.mock("next/navigation", () => ({
    usePathname: () => "/compliance",
}));

describe("BottomNav", () => {
    it("highlights the active route from the current pathname", () => {
        render(<BottomNav />);

        const complianceLink = screen.getByRole("link", { name: "Compliance" });
        expect(complianceLink).toHaveAttribute("aria-current", "page");
        expect(complianceLink.querySelector("span")?.className).toContain("bg-[#E2F5C8]");

        const overviewLink = screen.getByRole("link", { name: "Overview" });
        expect(overviewLink).not.toHaveAttribute("aria-current");
    });
});
