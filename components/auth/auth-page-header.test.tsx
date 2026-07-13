import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthPageHeader } from "./auth-page-header";

describe("AuthPageHeader", () => {
    it("stacks title and description vertically", () => {
        const { container } = render(
            <AuthPageHeader title="Login" description="Welcome back. Enter account details to login." />,
        );

        expect(screen.getByText("Login")).toBeInTheDocument();
        expect(screen.getByText("Welcome back. Enter account details to login.")).toBeInTheDocument();
        expect(container.firstElementChild).toHaveClass("flex", "flex-col");
    });
});
