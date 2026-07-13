import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileTextIcon } from "./file-text-icon";

describe("FileTextIcon", () => {
    it("renders an svg document icon", () => {
        const { container } = render(<FileTextIcon data-testid="file-text-icon" />);

        expect(container.querySelector("svg")).toBeInTheDocument();
        expect(container.querySelectorAll("path")).toHaveLength(4);
    });
});
