import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SlidersHorizontalIcon } from "./sliders-horizontal-icon";

describe("SlidersHorizontalIcon", () => {
    it("renders the sliders horizontal paths from the design asset", () => {
        const { container } = render(<SlidersHorizontalIcon />);

        expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 20 20");
        expect(container.querySelectorAll("path")).toHaveLength(6);
    });
});
