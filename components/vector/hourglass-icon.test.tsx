import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HourglassIcon } from "./hourglass-icon";

describe("HourglassIcon", () => {
    it("renders with currentColor fill for tinting", () => {
        const { container } = render(<HourglassIcon className="text-[#DC6803]" />);

        expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 12 17");
        expect(container.querySelector("path")?.getAttribute("fill")).toBe("currentColor");
    });
});
