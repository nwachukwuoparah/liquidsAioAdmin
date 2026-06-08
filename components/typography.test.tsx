import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Typography from "./typography";

describe("Typography truncation", () => {
    it("applies visual truncate classes when truncate is enabled", () => {
        const { container } = render(
            <Typography truncate lines={1} maxLength={120}>
                Short title
            </Typography>
        );

        expect(container.querySelector("span")?.className).toContain("truncate");
        expect(container.querySelector("div")?.className).toContain("min-w-0");
    });

    it("applies multi-line clamp styles when lines is greater than one", () => {
        const { container } = render(
            <Typography truncate lines={2} maxLength={120}>
                A longer title that should clamp to two lines in the layout
            </Typography>
        );

        const span = container.querySelector("span");
        expect(span?.style.display).toBe("-webkit-box");
        expect(span?.style.webkitLineClamp).toBe("2");
    });

    it("renders full text while still enabling truncation styles", () => {
        render(
            <Typography truncate lines={1} maxLength={120}>
                Mixed Electronics Pallet – Headphones, Speakers, Chargers
            </Typography>
        );

        expect(
            screen.getByText("Mixed Electronics Pallet – Headphones, Speakers, Chargers")
        ).toBeInTheDocument();
    });
});
