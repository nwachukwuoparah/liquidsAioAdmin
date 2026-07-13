import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";
import { DEFAULT_EMPTY_STATE_IMAGE_SRC } from "@/lib/constants/empty-state.constant";

describe("EmptyState", () => {
    it("renders the title, description, and default image", () => {
        render(<EmptyState title="No users found" />);

        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        expect(screen.getByText("No users found")).toBeInTheDocument();
        expect(
            screen.getByText("Try adjusting your filters or search terms."),
        ).toBeInTheDocument();

        const image = screen.getByRole("img", { name: "No users found" });
        expect(image.getAttribute("src")).toContain(encodeURIComponent(DEFAULT_EMPTY_STATE_IMAGE_SRC));
    });

    it("supports custom description and action content", () => {
        render(
            <EmptyState title="No orders found" description="Nothing matches this tab yet.">
                <button type="button">Clear filters</button>
            </EmptyState>,
        );

        expect(screen.getByText("Nothing matches this tab yet.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
    });
});
