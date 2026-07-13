import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileAvatar } from "./profile-avatar";

describe("ProfileAvatar", () => {
    it("uses the first letter of email when no name is available", () => {
        render(<ProfileAvatar name="" email="marvin@example.com" isLoading={false} />);

        expect(screen.getByText("M")).toBeInTheDocument();
    });

    it("renders initials when no image url is provided", () => {
        render(<ProfileAvatar name="Samuel Nathaniel" isLoading={false} />);

        expect(screen.getByText("SN")).toBeInTheDocument();
    });

    it("uses provided initials when supplied", () => {
        render(<ProfileAvatar name="Samuel Nathaniel" initials="NO" isLoading={false} />);

        expect(screen.getByText("NO")).toBeInTheDocument();
    });

    it("renders a blank shell while loading", () => {
        render(<ProfileAvatar name="Samuel Nathaniel" isLoading />);

        expect(screen.queryByText("SN")).not.toBeInTheDocument();
    });

    it("renders the profile image when a url is provided", () => {
        render(
            <ProfileAvatar
                name="Samuel Nathaniel"
                imageUrl="https://cdn.example.com/profile.jpg"
            />,
        );

        expect(screen.getByRole("img", { name: "Samuel Nathaniel profile" })).toHaveAttribute(
            "src",
            "https://cdn.example.com/profile.jpg",
        );
    });
});
