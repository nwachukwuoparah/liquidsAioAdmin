import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "./header";

vi.mock("@/lib/auth/hooks/use-admin-session-profile", () => ({
    useAdminSessionProfile: () => ({
        sessionProfile: {
            displayName: "Nwachukwu Oparah",
            email: "n****rah@gmail.com",
            roleLabel: "SUPER ADMIN",
            profileImageUrl:
                "https://res.cloudinary.com/extelvogroup/image/upload/v1783653081/profiles/SwhvZlC2nQv0/profile-picture.png",
            initials: "NO",
        },
        isSessionProfileReady: true,
    }),
}));

describe("Header", () => {
    it("renders mobile avatar trigger beside the page title", () => {
        const { container } = render(<Header title="Compliance" />);

        expect(screen.getByRole("heading", { name: "Compliance" })).toBeInTheDocument();
        expect(container.querySelectorAll('[aria-label="Open user menu"]')).toHaveLength(2);
        expect(screen.getByRole("button", { name: "View notifications" })).toBeInTheDocument();
        expect(screen.getAllByRole("img", { name: "Nwachukwu Oparah profile" })).toHaveLength(2);
    });
});
