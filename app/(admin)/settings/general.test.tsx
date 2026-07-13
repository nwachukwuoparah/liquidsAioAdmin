import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";
import { GeneralSettings } from "./general";

const { getMock, postMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
    postMock: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
    apiClient: {
        get: getMock,
        post: postMock,
    },
}));

function mockGeneralSettingsApi() {
    getMock.mockResolvedValue({
        body: {
            status: "success",
            data: {
                contactEmail: "support@liquidsaio.com",
                phoneNumber: "+15555550199",
                phoneNumberCountryCode: "US",
            },
        },
    });
}

describe("GeneralSettings", () => {
    beforeEach(() => {
        getMock.mockReset();
        postMock.mockReset();
    });

    it("shows a shape-matched loading skeleton while company info loads", () => {
        getMock.mockReturnValue(new Promise(() => undefined));
        renderWithQueryClient(<GeneralSettings />);

        expect(screen.getByTestId("general-settings-skeleton")).toBeInTheDocument();
        expect(screen.queryByLabelText("Contact email")).not.toBeInTheDocument();
    });

    it("loads contact email and support phone from GET /company/info", async () => {
        mockGeneralSettingsApi();
        renderWithQueryClient(<GeneralSettings />);

        expect(await screen.findByDisplayValue("support@liquidsaio.com")).toBeInTheDocument();
        expect(screen.getByLabelText("Support phone")).toHaveValue("+1 555 555 0199");
        expect(getMock).toHaveBeenCalledWith("/company/info");
    });

    it("populates the UI when company info returns a national phone number", async () => {
        getMock.mockResolvedValue({
            body: {
                status: "success",
                data: {
                    contactEmail: "help@liquidsaio.com",
                    phoneNumber: "8005550199",
                    phoneNumberCountryCode: "US",
                },
            },
        });

        renderWithQueryClient(<GeneralSettings />);

        expect(await screen.findByDisplayValue("help@liquidsaio.com")).toBeInTheDocument();
        expect(screen.getByLabelText("Support phone")).toHaveValue("+1 800 555 0199");
    });

    it("leaves email empty when company info has not been created yet", async () => {
        getMock.mockResolvedValue({
            body: {
                status: "success",
                data: null,
            },
        });

        renderWithQueryClient(<GeneralSettings />);

        expect(await screen.findByLabelText("Contact email")).toHaveValue("");
        expect(screen.getByLabelText("Support phone")).toHaveValue("+1");
    });

    it("returns to Edit without posting when Save is clicked with no changes", async () => {
        mockGeneralSettingsApi();
        renderWithQueryClient(<GeneralSettings />);

        await screen.findByDisplayValue("support@liquidsaio.com");
        fireEvent.click(screen.getByRole("button", { name: "Edit general settings" }));
        fireEvent.click(screen.getByRole("button", { name: "Save general settings" }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Edit general settings" })).toBeInTheDocument();
        });
        expect(postMock).not.toHaveBeenCalled();
        expect(screen.getByLabelText("Contact email")).toBeDisabled();
    });

    it("posts company info and shows a saving spinner while pending", async () => {
        mockGeneralSettingsApi();
        let resolvePost!: (value: unknown) => void;
        const postPromise = new Promise((resolve) => {
            resolvePost = resolve;
        });
        postMock.mockReturnValue(postPromise);
        getMock
            .mockResolvedValueOnce({
                body: {
                    status: "success",
                    data: {
                        contactEmail: "support@liquidsaio.com",
                        phoneNumber: "+15555550199",
                        phoneNumberCountryCode: "US",
                    },
                },
            })
            .mockResolvedValueOnce({
                body: {
                    status: "success",
                    data: {
                        contactEmail: "ops@liquidsaio.com",
                        phoneNumber: "+18005550100",
                        phoneNumberCountryCode: "US",
                    },
                },
            });

        renderWithQueryClient(<GeneralSettings />);

        await screen.findByDisplayValue("support@liquidsaio.com");
        fireEvent.click(screen.getByRole("button", { name: "Edit general settings" }));

        fireEvent.change(screen.getByLabelText("Contact email"), {
            target: { value: "ops@liquidsaio.com" },
        });
        fireEvent.change(screen.getByLabelText("Support phone"), {
            target: { value: "+18005550100" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save general settings" }));

        expect(await screen.findByText("Saving...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save general settings" })).toBeDisabled();

        resolvePost({
            body: {
                status: "success",
                message: "Company info created.",
                data: {
                    contactEmail: "ops@liquidsaio.com",
                    phoneNumber: "+18005550100",
                    phoneNumberCountryCode: "US",
                },
            },
        });

        await waitFor(() => {
            expect(postMock).toHaveBeenCalledWith("/settings/company-info", {
                contactEmail: "ops@liquidsaio.com",
                phoneNumber: "+18005550100",
                phoneNumberCountryCode: "US",
            });
        });

        expect(await screen.findByDisplayValue("ops@liquidsaio.com")).toBeInTheDocument();
        expect(screen.getByLabelText("Support phone")).toHaveValue("+1 800 555 0100");
        expect(screen.getByRole("button", { name: "Edit general settings" })).toBeInTheDocument();
    });

    it("shows validation errors and does not post when fields are invalid", async () => {
        mockGeneralSettingsApi();
        renderWithQueryClient(<GeneralSettings />);

        await screen.findByDisplayValue("support@liquidsaio.com");
        fireEvent.click(screen.getByRole("button", { name: "Edit general settings" }));

        fireEvent.change(screen.getByLabelText("Contact email"), {
            target: { value: "not-an-email" },
        });
        fireEvent.change(screen.getByLabelText("Support phone"), {
            target: { value: "+1555" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save general settings" }));

        expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
        expect(screen.getByText("Enter a valid phone number.")).toBeInTheDocument();
        expect(postMock).not.toHaveBeenCalled();
    });

    it("requires a contact email before saving", async () => {
        mockGeneralSettingsApi();
        renderWithQueryClient(<GeneralSettings />);

        await screen.findByDisplayValue("support@liquidsaio.com");
        fireEvent.click(screen.getByRole("button", { name: "Edit general settings" }));

        fireEvent.change(screen.getByLabelText("Contact email"), {
            target: { value: "" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save general settings" }));

        expect(await screen.findByText("Email is required.")).toBeInTheDocument();
        expect(postMock).not.toHaveBeenCalled();
    });

    it("requires a support phone before saving", async () => {
        mockGeneralSettingsApi();
        renderWithQueryClient(<GeneralSettings />);

        await screen.findByDisplayValue("support@liquidsaio.com");
        fireEvent.click(screen.getByRole("button", { name: "Edit general settings" }));

        fireEvent.change(screen.getByLabelText("Support phone"), {
            target: { value: "" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Save general settings" }));

        expect(await screen.findByText("Phone number is required.")).toBeInTheDocument();
        expect(postMock).not.toHaveBeenCalled();
    });
});
