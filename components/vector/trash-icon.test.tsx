import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrashIcon } from "./trash-icon";

describe("TrashIcon", () => {
    it("renders with currentColor stroke for tinting", () => {
        const { container } = render(<TrashIcon className="text-[#0B0E05]" />);

        const paths = container.querySelectorAll("path");
        expect(paths.length).toBeGreaterThan(0);
        paths.forEach((path) => {
            expect(path.getAttribute("stroke")).toBe("currentColor");
        });
    });
});
