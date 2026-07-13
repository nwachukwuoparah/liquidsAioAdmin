import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import { ProfileSettings } from "./profile";

const { getMock, patchMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
    patchMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: getMock,
        patch: patchMock,
        post: vi.fn(),
    },
}));

function mockProfileSettingsApi() {
    getMock.mockResolvedValue({
        body: {
            status: "success",
            data: {
                profile: {
                    firstName: "Samuel",
                    lastName: "Nathaniel",
                    email: "samuel@liquidsaio.com",
                    phoneNumber: "2124567890",
                    phoneNumberCountryCode: "US",
                    timezone: "gmt-05",
                    profilePicture: null,
                },
            },
        },
    });
}

describe("ProfileSettings", () => {
    beforeEach(() => {
        getMock.mockReset();
        patchMock.mockReset();
    });

    it("shows a shape-matched loading skeleton while profile data loads", () => {
        getMock.mockReturnValue(new Promise(() => undefined));
        renderWithQueryClient(<ProfileSettings />);

        expect(screen.getByTestId("profile-settings-skeleton")).toBeInTheDocument();
        expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    });

    it("uses bordered cards without shadows", async () => {
        mockProfileSettingsApi();
        const { container } = renderWithQueryClient(<ProfileSettings />);

        expect(await screen.findByDisplayValue("Samuel Nathaniel")).toBeInTheDocument();
        expect(container.firstElementChild).toHaveClass("lg:rounded-[12px]");
        expect(container.firstElementChild).toHaveClass("lg:border");
        expect(container.firstElementChild?.className).not.toContain("shadow-card");
        expect(container.querySelectorAll(".shadow-card")).toHaveLength(0);
    });

    it("fetches the signed-in profile via GET /profile/me", async () => {
        mockProfileSettingsApi();
        renderWithQueryClient(<ProfileSettings />);

        await screen.findByDisplayValue("Samuel Nathaniel");
        expect(getMock).toHaveBeenCalledWith("/profile/me");
    });

    it("populates profile inputs and email from the profile me response", async () => {
        mockProfileSettingsApi();
        renderWithQueryClient(<ProfileSettings />);

        expect(await screen.findByDisplayValue("Samuel Nathaniel")).toBeInTheDocument();
        expect(screen.getByLabelText("Phone number")).toHaveValue("+1 212 456 7890");
        expect(screen.getByText("[samuel@liquidsaio.com]")).toBeInTheDocument();
        expect(screen.queryByText("Two-factor authentication")).not.toBeInTheDocument();
    });

    it("renders inactive field styling when not editing", async () => {
        mockProfileSettingsApi();
        const { container } = renderWithQueryClient(<ProfileSettings />);

        const fullNameInput = await screen.findByDisplayValue("Samuel Nathaniel");
        expect(fullNameInput).toBeDisabled();
        expect(fullNameInput.closest("div")?.className).toContain("bg-slate-50/70");
        expect(container.querySelectorAll(".bg-slate-50\\/70").length).toBeGreaterThanOrEqual(1);
    });

    it("keeps profile image upload available outside edit mode", async () => {
        mockProfileSettingsApi();
        renderWithQueryClient(<ProfileSettings />);

        expect(await screen.findByText("SN")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload image" })).toBeEnabled();
        expect(screen.getByDisplayValue("Samuel Nathaniel")).toBeDisabled();
    });

    it("enables profile form fields when editing", async () => {
        mockProfileSettingsApi();
        renderWithQueryClient(<ProfileSettings />);

        await screen.findByDisplayValue("Samuel Nathaniel");
        fireEvent.click(screen.getByRole("button", { name: "Edit profile settings" }));

        await waitFor(() => {
            expect(screen.getByDisplayValue("Samuel Nathaniel")).not.toBeDisabled();
        });

        expect(screen.getByLabelText("Phone number")).not.toBeDisabled();
        expect(screen.getByRole("button", { name: "Save profile settings" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Upload image" })).toBeEnabled();
    });

    it("returns to Edit without posting when Save is clicked with no changes", async () => {
        mockProfileSettingsApi();
        renderWithQueryClient(<ProfileSettings />);

        await screen.findByDisplayValue("Samuel Nathaniel");
        fireEvent.click(screen.getByRole("button", { name: "Edit profile settings" }));
        fireEvent.click(screen.getByRole("button", { name: "Save profile settings" }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Edit profile settings" })).toBeInTheDocument();
        });
        expect(patchMock).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue("Samuel Nathaniel")).toBeDisabled();
    });

    it("validates inputs and does not post invalid values", async () => {
        mockProfileSettingsApi();
        renderWithQueryClient(<ProfileSettings />);

        await screen.findByDisplayValue("Samuel Nathaniel");
        fireEvent.click(screen.getByRole("button", { name: "Edit profile settings" }));

        fireEvent.change(screen.getByLabelText("Full name"), {
            target: { value: "Samuel" },
        });
        fireEvent.change(screen.getByLabelText("Phone number"), {
            target: { value: "+1" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save profile settings" }));

        expect(await screen.findByText("Enter your first and last name.")).toBeInTheDocument();
        expect(screen.getByText("Phone number is required.")).toBeInTheDocument();
        expect(patchMock).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Save profile settings" })).toBeInTheDocument();
    });

    it("shows a spinner on the save button while the profile patch is pending", async () => {
        mockProfileSettingsApi();
        let resolvePatch: (value: unknown) => void = () => undefined;
        patchMock.mockReturnValue(
            new Promise((resolve) => {
                resolvePatch = resolve;
            }),
        );

        renderWithQueryClient(<ProfileSettings />);

        await screen.findByDisplayValue("Samuel Nathaniel");
        fireEvent.click(screen.getByRole("button", { name: "Edit profile settings" }));

        fireEvent.change(screen.getByLabelText("Full name"), {
            target: { value: "Jude Nnamdi" },
        });
        fireEvent.change(screen.getByLabelText("Phone number"), {
            target: { value: "+18005550100" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save profile settings" }));

        expect(await screen.findByText("Saving...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save profile settings" })).toBeDisabled();

        resolvePatch({
            body: {
                status: "success",
                message: "Profile updated.",
                data: {},
            },
        });

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Edit profile settings" })).toBeInTheDocument();
        });
    });

    it("patches profile updates when the form is dirty and valid", async () => {
        mockProfileSettingsApi();
        patchMock.mockResolvedValue({
            body: {
                status: "success",
                message: "Profile updated.",
                data: {},
            },
        });

        renderWithQueryClient(<ProfileSettings />);

        await screen.findByDisplayValue("Samuel Nathaniel");
        fireEvent.click(screen.getByRole("button", { name: "Edit profile settings" }));

        fireEvent.change(screen.getByLabelText("Full name"), {
            target: { value: "Jude Nnamdi" },
        });
        fireEvent.change(screen.getByLabelText("Phone number"), {
            target: { value: "+18005550100" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save profile settings" }));

        await waitFor(() => {
            expect(patchMock).toHaveBeenCalledWith(
                "/profile/admins",
                expect.objectContaining({
                    firstName: "Jude",
                    lastName: "Nnamdi",
                    phoneNumber: "+18005550100",
                    phoneNumberCountryCode: "US",
                    timezone: expect.any(String),
                }),
            );
        });

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Edit profile settings" })).toBeInTheDocument();
        });
    });
});
