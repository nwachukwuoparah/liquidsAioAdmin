import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileSettings } from "./profile";

describe("ProfileSettings", () => {
    it("uses rounded corners on desktop", () => {
        const { container } = render(<ProfileSettings />);

        expect(container.firstElementChild).toHaveClass("lg:rounded-[12px]");
    });

    it("renders inactive field styling when not editing", () => {
        const { container } = render(<ProfileSettings />);

        const fullNameInput = screen.getByDisplayValue("Samuel Nathaniel");
        expect(fullNameInput).toBeDisabled();
        expect(fullNameInput.closest("div")?.className).toContain("bg-slate-50/70");
        expect(container.querySelectorAll(".bg-slate-50\\/70").length).toBeGreaterThanOrEqual(3);
    });

    it("keeps profile image upload available outside edit mode", () => {
        render(<ProfileSettings />);

        expect(screen.getByText("SN")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload image" })).toBeEnabled();
        expect(screen.getByDisplayValue("Samuel Nathaniel")).toBeDisabled();
    });

    it("enables profile form fields when editing", () => {
        render(<ProfileSettings />);

        fireEvent.click(screen.getByRole("button", { name: "Edit profile settings" }));

        expect(screen.getByDisplayValue("Samuel Nathaniel")).not.toBeDisabled();
        expect(screen.getByDisplayValue("212-456-7890")).not.toBeDisabled();
        expect(screen.getByRole("combobox")).not.toBeDisabled();
        expect(screen.getByRole("button", { name: "Save profile settings" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload image" })).toBeEnabled();
    });
});
