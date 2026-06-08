import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AllLotsContentSection from "./page";

describe("AllLotsContentSection mobile layout", () => {
    it("renders a full-width mobile panel with shadowed lot cards", () => {
        const { container } = render(<AllLotsContentSection />);

        const mobilePanel = container.querySelector(".rounded-t-\\[32px\\].md\\:hidden");
        expect(mobilePanel).toBeInTheDocument();
        expect(mobilePanel).toHaveClass("w-full", "shadow-card");

        const lotCards = within(mobilePanel as HTMLElement).getAllByTestId("mobile-lot-card");
        expect(lotCards.length).toBeGreaterThan(0);
        lotCards.forEach((card) => {
            expect(card.className).toContain("shadow-card");
            expect(card.className).toContain("border-0");
            expect(card.className).not.toContain("border-[#0B0E0514]");
        });
    });

    it("renders seller and item stats inside mobile lot cards", () => {
        const { container } = render(<AllLotsContentSection />);

        const mobilePanel = container.querySelector(".rounded-t-\\[32px\\].md\\:hidden") as HTMLElement;
        const firstCard = within(mobilePanel).getAllByTestId("mobile-lot-card")[0];

        expect(within(firstCard).getByText("John stockton")).toBeInTheDocument();
        expect(within(firstCard).getByText(/50 items/i)).toBeInTheDocument();
        expect(within(firstCard).getByText("$200")).toBeInTheDocument();
    });

    it("switches mobile filter tabs", () => {
        const { container } = render(<AllLotsContentSection />);

        const mobilePanel = container.querySelector(".rounded-t-\\[32px\\].md\\:hidden") as HTMLElement;
        const suspendedTab = within(mobilePanel).getByRole("button", { name: "Suspended" });
        fireEvent.click(suspendedTab);

        expect(suspendedTab.className).toContain("border-[#518300]");
    });
});
