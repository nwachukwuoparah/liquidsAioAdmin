import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import ComplianceActionMenu from "@/components/compliance-action-menu";
import {
    buildMenuStyle,
    FLOATING_MENU_Z_INDEX,
    useFloatingMenu,
} from "@/lib/hooks/use-floating-menu";

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        showModal: vi.fn(),
        closeModal: vi.fn(),
    }),
}));

vi.mock("@/lib/admin/hooks/use-admin-compliance", () => ({
    useAdminComplianceAction: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

function FloatingMenuExample({
    isOpen,
    onClose,
    placement = "top" as const,
}: {
    isOpen: boolean;
    onClose: () => void;
    placement?: "top" | "bottom" | "auto";
}) {
    const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
        isOpen,
        onClose,
        placement,
        align: "right",
    });

    return (
        <>
            <button ref={triggerRef} type="button" data-testid="trigger">
                Open menu
            </button>
            <FloatingMenuPortal
                isOpen={isOpen}
                isMounted={isMounted}
                menuRef={menuRef}
                menuStyle={menuStyle}
                data-testid="floating-menu"
            >
                Menu content
            </FloatingMenuPortal>
        </>
    );
}

describe("buildMenuStyle", () => {
    it("keeps bottom menus below the trigger instead of clamping over it", () => {
        Object.defineProperty(window, "innerHeight", { configurable: true, value: 400 });
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 1200 });

        const triggerRect = {
            x: 1000,
            y: 20,
            top: 20,
            left: 1000,
            right: 1100,
            bottom: 56,
            width: 100,
            height: 36,
            toJSON: () => ({}),
        } as DOMRect;

        const style = buildMenuStyle(triggerRect, 288, 320, {
            placement: "bottom",
            align: "right",
            offset: 12,
            matchTriggerWidth: false,
        });

        expect(style.top).toBeGreaterThanOrEqual(triggerRect.bottom + 12);
        expect(style.transform).toBeUndefined();
    });

    it("right-aligns the menu flush with the trigger using the right edge", () => {
        Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });

        const triggerRect = {
            x: 1160,
            y: 16,
            top: 16,
            left: 1160,
            right: 1240,
            bottom: 56,
            width: 80,
            height: 40,
            toJSON: () => ({}),
        } as DOMRect;

        const style = buildMenuStyle(triggerRect, 288, 280, {
            placement: "bottom",
            align: "right",
            offset: 8,
            matchTriggerWidth: false,
        });

        expect(style.right).toBe(1280 - 1240);
        expect(style.left).toBe("auto");
        expect(style.top).toBe(64);
    });

    it("flips above the trigger when bottom placement cannot fit", () => {
        Object.defineProperty(window, "innerHeight", { configurable: true, value: 400 });
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 1200 });

        const triggerRect = {
            x: 100,
            y: 300,
            top: 300,
            left: 100,
            right: 160,
            bottom: 336,
            width: 60,
            height: 36,
            toJSON: () => ({}),
        } as DOMRect;

        const style = buildMenuStyle(triggerRect, 208, 280, {
            placement: "bottom",
            align: "right",
            offset: 8,
            matchTriggerWidth: false,
        });

        expect(style.transform).toBe("translateY(-100%)");
        expect(style.top).toBe(triggerRect.top - 8);
    });
});

describe("useFloatingMenu", () => {
    beforeEach(() => {
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            x: 100,
            y: 200,
            top: 200,
            left: 100,
            right: 160,
            bottom: 236,
            width: 60,
            height: 36,
            toJSON: () => ({}),
        });
    });

    it("renders the menu in a body portal with fixed positioning", () => {
        render(<FloatingMenuExample isOpen onClose={vi.fn()} />);

        const menu = screen.getByTestId("floating-menu");
        expect(menu.parentElement).toBe(document.body);
        expect(menu.style.position).toBe("fixed");
        expect(Number(menu.style.zIndex)).toBe(FLOATING_MENU_Z_INDEX);
    });

    it("positions top menus above the trigger", () => {
        render(<FloatingMenuExample isOpen onClose={vi.fn()} placement="top" />);

        const menu = screen.getByTestId("floating-menu");
        expect(menu.style.transform).toBe("translateY(-100%)");
    });

    it("flips auto placement upward when there is not enough space below", () => {
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            x: 100,
            y: 700,
            top: 700,
            left: 100,
            right: 160,
            bottom: 736,
            width: 60,
            height: 36,
            toJSON: () => ({}),
        });
        Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });

        render(<FloatingMenuExample isOpen onClose={vi.fn()} placement="auto" />);

        const menu = screen.getByTestId("floating-menu");
        expect(menu.style.transform).toBe("translateY(-100%)");
    });

    it("keeps auto placement below when there is enough space", () => {
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            x: 100,
            y: 100,
            top: 100,
            left: 100,
            right: 160,
            bottom: 136,
            width: 60,
            height: 36,
            toJSON: () => ({}),
        });
        Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });

        render(<FloatingMenuExample isOpen onClose={vi.fn()} placement="auto" />);

        const menu = screen.getByTestId("floating-menu");
        expect(menu.style.transform).not.toBe("translateY(-100%)");
        expect(Number.parseFloat(menu.style.top)).toBeGreaterThan(136);
    });

    it("closes when clicking outside the trigger and menu", () => {
        const onClose = vi.fn();

        render(
            <>
                <FloatingMenuExample isOpen onClose={onClose} />
                <button type="button" data-testid="outside">
                    Outside
                </button>
            </>,
        );

        fireEvent.mouseDown(screen.getByTestId("outside"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

describe("ComplianceActionMenu portal rendering", () => {
    it("renders the action menu in document.body when open", () => {
        render(<ComplianceActionMenu userId="review-1" accountType="Buyer" isOpen onToggle={vi.fn()} onClose={vi.fn()} />);

        const menu = screen.getByTestId("compliance-action-menu");
        expect(menu.parentElement).toBe(document.body);
        expect(menu.style.position).toBe("fixed");
    });
});
