import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SettingsLayout from "./layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/profile",
  useRouter: () => ({ back: vi.fn() }),
}));

describe("SettingsLayout", () => {
  it("renders mobile settings header with compact tabs", () => {
    render(
      <SettingsLayout>
        <div>Settings content</div>
      </SettingsLayout>,
    );

    expect(screen.getByText("Settings")).toBeInTheDocument();

    const mobileActiveTab = screen.getAllByRole("link", { name: "My profile" })[0];
    expect(mobileActiveTab).toHaveClass("text-[#518300]");
    expect(mobileActiveTab.querySelector("span[aria-hidden]")).toHaveClass("bg-[#518300]");
    expect(screen.getAllByRole("link", { name: "General" })[0]).toHaveClass("text-[#0B0E05A3]");
    expect(screen.getByText("Settings content")).toBeInTheDocument();
  });

  it("renders desktop tabs with padded border-bottom style", () => {
    render(
      <SettingsLayout>
        <div>Settings content</div>
      </SettingsLayout>,
    );

    const desktopActiveTab = screen.getAllByRole("link", { name: "My profile" })[1];
    expect(desktopActiveTab).toHaveClass("border-[#518300]", "px-5", "py-3");
    expect(desktopActiveTab.querySelector("span[aria-hidden]")).toBeNull();

    const desktopGeneralTab = screen.getAllByRole("link", { name: "General" })[1];
    expect(desktopGeneralTab).toHaveClass("border-transparent", "px-5");
  });
});
