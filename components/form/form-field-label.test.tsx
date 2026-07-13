import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormFieldLabel } from "./form-field-label";

describe("FormFieldLabel", () => {
    it("shows a red required asterisk when the field is required", () => {
        render(
            <FormFieldLabel
                label="Email address"
                htmlFor="email-address"
                isRequired
            />,
        );

        expect(screen.getByText("*")).toHaveClass("text-[#CC2929]");
        expect(screen.getByText("Email address")).toBeInTheDocument();
    });

    it("hides the required asterisk when showRequiredIndicator is false", () => {
        render(
            <FormFieldLabel
                label="Email address"
                htmlFor="email-address"
                isRequired
                showRequiredIndicator={false}
            />,
        );

        expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("renders optional hint copy below the label in a column layout", () => {
        const { container } = render(
            <FormFieldLabel
                label="Role"
                htmlFor="role"
                hint="Choose what parts of the dashboard they can access."
            />,
        );

        expect(
            screen.getByText("Choose what parts of the dashboard they can access."),
        ).toBeInTheDocument();
        expect(container.firstChild).toHaveClass("flex", "flex-col");
    });
});
