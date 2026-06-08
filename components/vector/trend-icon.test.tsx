import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrendIcon } from "./trend-icon";

describe("TrendIcon", () => {
    it("renders with currentColor stroke for tinting", () => {
        const { container } = render(<TrendIcon className="text-[#00A341]" />);

        expect(container.querySelector("path")?.getAttribute("stroke")).toBe("currentColor");
    });

    it("flips vertically for down trends", () => {
        const { container } = render(<TrendIcon direction="down" />);

        expect(container.querySelector("svg")?.getAttribute("class")).toContain("-scale-y-100");
    });
});
