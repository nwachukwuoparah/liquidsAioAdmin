import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UserProfileMenu from "./user-profile-menu";

describe("UserProfileMenu", () => {
    it("opens the menu when the avatar-only trigger is clicked", () => {
        render(<UserProfileMenu variant="avatar-only" menuAlign="left" />);

        expect(screen.queryByText("Profile")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Teams & permission")).toBeInTheDocument();
    });

    it("renders the default trigger with list icon on desktop", () => {
        const { container } = render(<UserProfileMenu />);

        const trigger = screen.getByRole("button", { name: "Open user menu" });
        expect(trigger.className).toContain("rounded-xl");
        expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(1);
    });
});
