import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Sidebar from "./sidebar";

vi.mock("next/navigation", () => ({
    usePathname: () => "/orders",
}));

describe("Sidebar", () => {
    it("renders only on desktop", () => {
        const { container } = render(<Sidebar />);

        expect(container.querySelector("aside")?.className).toContain("hidden");
        expect(container.querySelector("aside")?.className).toContain("lg:flex");
    });
});
