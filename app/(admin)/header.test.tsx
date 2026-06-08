import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "./header";

describe("Header", () => {
    it("renders mobile avatar trigger beside the page title", () => {
        const { container } = render(<Header title="Compliance" />);

        expect(screen.getByRole("heading", { name: "Compliance" })).toBeInTheDocument();
        expect(container.querySelectorAll('[aria-label="Open user menu"]')).toHaveLength(2);
        expect(screen.getByRole("button", { name: "View notifications" })).toBeInTheDocument();
    });
});
