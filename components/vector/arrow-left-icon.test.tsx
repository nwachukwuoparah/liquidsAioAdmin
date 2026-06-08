import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArrowLeftIcon } from "./arrow-left-icon";

describe("ArrowLeftIcon", () => {
    it("renders the arrow left path from the design asset", () => {
        const { container } = render(<ArrowLeftIcon />);
        const path = container.querySelector("path");

        expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 24 24");
        expect(path?.getAttribute("fill")).toBe("currentColor");
        expect(path?.getAttribute("d")).toContain("M21.0006 12.0004");
    });
});
