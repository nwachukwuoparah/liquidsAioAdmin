import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SearchInput from "./search-input";

describe("SearchInput", () => {
    it("renders a search field with magnifying glass icon", () => {
        const { container } = render(
            <SearchInput placeholder="Search lots by title" value="" onChange={() => {}} />
        );

        expect(screen.getByPlaceholderText("Search lots by title")).toBeInTheDocument();
        expect(container.querySelector("svg")).toBeInTheDocument();
    });
});
