import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UserProfileMenu from "./user-profile-menu";
import type { AdminSessionProfile } from "@/lib/auth/utilities/resolve-admin-session-profile";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";

const showModalMock = vi.fn();

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: showModalMock,
        closeModal: vi.fn(),
    }),
}));

const sampleSessionProfile: AdminSessionProfile = {
    displayName: "Samuel Nathaniel",
    email: "samuelnath@email.com",
    roleLabel: "ADMIN",
    profileImageUrl: null,
    initials: "SN",
};

const sampleSessionProfileWithPhoto: AdminSessionProfile = {
    ...sampleSessionProfile,
    displayName: "Nwachukwu Oparah",
    email: "n****rah@gmail.com",
    roleLabel: "SUPER ADMIN",
    profileImageUrl:
        "https://res.cloudinary.com/extelvogroup/image/upload/v1783653081/profiles/SwhvZlC2nQv0/profile-picture.png",
    initials: "NO",
};

describe("UserProfileMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
        Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            x: 1160,
            y: 16,
            top: 16,
            left: 1160,
            right: 1240,
            bottom: 56,
            width: 80,
            height: 40,
            toJSON: () => ({}),
        });
    });

    it("opens the menu when the avatar-only trigger is clicked", () => {
        render(
            <UserProfileMenu
                variant="avatar-only"
                menuAlign="left"
                sessionProfile={sampleSessionProfile}
                isSessionProfileReady
            />,
        );

        expect(screen.queryByText("Profile")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Teams & permission")).toBeInTheDocument();
    });

    it("renders the default trigger with list icon on desktop", () => {
        const { container } = render(
            <UserProfileMenu
                sessionProfile={sampleSessionProfile}
                isSessionProfileReady
            />,
        );

        const trigger = screen.getByRole("button", { name: "Open user menu" });
        expect(trigger.className).toContain("rounded-xl");
        expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(1);
    });

    it("populates name and email from the session profile", async () => {
        render(
            <UserProfileMenu
                sessionProfile={sampleSessionProfile}
                isSessionProfileReady
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

        await waitFor(() => {
            expect(screen.getByText("Samuel Nathaniel")).toBeInTheDocument();
        });
        expect(screen.getByText("samuelnath@email.com")).toBeInTheDocument();
        expect(screen.getByText("ADMIN")).toBeInTheDocument();
        expect(screen.getAllByText("SN")).toHaveLength(2);
    });

    it("shows a loading avatar shell before session profile is ready", () => {
        render(
            <UserProfileMenu
                sessionProfile={null}
                isSessionProfileReady={false}
            />,
        );

        expect(screen.queryByText("SN")).not.toBeInTheDocument();
    });

    it("anchors the open menu under the trigger with right alignment", async () => {
        render(
            <UserProfileMenu
                sessionProfile={sampleSessionProfile}
                isSessionProfileReady
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

        const menu = await screen.findByText("Profile");
        const menuRoot = menu.closest("div.w-72");

        expect(menuRoot).not.toBeNull();
        expect(menuRoot).toHaveStyle({
            position: "fixed",
            right: "40px",
            top: "64px",
        });
    });

    it("renders the JWT profile picture in the trigger and open menu", async () => {
        render(
            <UserProfileMenu
                sessionProfile={sampleSessionProfileWithPhoto}
                isSessionProfileReady
            />,
        );

        const triggerImages = screen.getAllByRole("img", { name: "Nwachukwu Oparah profile" });
        expect(triggerImages[0]).toHaveAttribute(
            "src",
            sampleSessionProfileWithPhoto.profileImageUrl,
        );

        fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

        await waitFor(() => {
            expect(screen.getAllByRole("img", { name: "Nwachukwu Oparah profile" })).toHaveLength(2);
        });
    });

    it("opens the logout confirmation modal when Logout is clicked", async () => {
        render(
            <UserProfileMenu
                sessionProfile={sampleSessionProfile}
                isSessionProfileReady
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));
        fireEvent.click(screen.getByRole("button", { name: "Logout" }));

        await waitFor(() => {
            expect(showModalMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
                    dismissOnOverlayClick: false,
                }),
            );
        });
    });
});
