"use client";

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type RefObject,
} from "react";

export const FLOATING_MENU_Z_INDEX = 2147483000;

export type FloatingMenuAlign = "left" | "right";
export type FloatingMenuPlacement = "top" | "bottom" | "auto";

export interface UseFloatingMenuOptions {
    isOpen: boolean;
    onClose: () => void;
    placement?: FloatingMenuPlacement;
    align?: FloatingMenuAlign;
    offset?: number;
    matchTriggerWidth?: boolean;
}

export type FloatingMenuPositionStyle = CSSProperties & {
    position: "fixed";
    top: number;
    zIndex: number;
};

function resolvePlacement(
    placement: FloatingMenuPlacement,
    triggerRect: DOMRect,
    menuHeight: number,
    offset: number,
): "top" | "bottom" {
    if (placement === "top" || placement === "bottom") {
        return placement;
    }

    const estimatedHeight = menuHeight || 160;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    return spaceBelow >= estimatedHeight + offset || spaceBelow >= spaceAbove
        ? "bottom"
        : "top";
}

/** Builds fixed-position styles for a floating menu relative to its trigger. */
export function buildMenuStyle(
    triggerRect: DOMRect,
    menuWidth: number,
    menuHeight: number,
    options: {
        placement: FloatingMenuPlacement;
        align: FloatingMenuAlign;
        offset: number;
        matchTriggerWidth: boolean;
    },
): FloatingMenuPositionStyle {
    const { placement, align, offset, matchTriggerWidth } = options;
    let resolvedPlacement = resolvePlacement(placement, triggerRect, menuHeight, offset);
    const effectiveWidth = matchTriggerWidth ? triggerRect.width : menuWidth || 288;
    const viewportPadding = 8;

    const preferredBottomTop = triggerRect.bottom + offset;
    const preferredTopAnchor = triggerRect.top - offset;

    // If a forced bottom placement would overflow the viewport, flip above the trigger
    // instead of clamping upward over the trigger button.
    if (
        resolvedPlacement === "bottom" &&
        menuHeight > 0 &&
        preferredBottomTop + menuHeight > window.innerHeight - viewportPadding
    ) {
        const spaceAbove = triggerRect.top - offset - viewportPadding;
        if (spaceAbove >= menuHeight || spaceAbove >= window.innerHeight - triggerRect.bottom) {
            resolvedPlacement = "top";
        }
    }

    const style: FloatingMenuPositionStyle = {
        position: "fixed",
        zIndex: FLOATING_MENU_Z_INDEX,
        top: 0,
    };

    // Anchor with `right` for right-aligned menus so the edge stays flush with the trigger.
    if (align === "right") {
        const right = Math.max(
            viewportPadding,
            window.innerWidth - triggerRect.right,
        );
        const maxRight = Math.max(
            viewportPadding,
            window.innerWidth - effectiveWidth - viewportPadding,
        );
        style.right = Math.min(right, maxRight);
        style.left = "auto";
    } else {
        style.left = Math.max(
            viewportPadding,
            Math.min(triggerRect.left, window.innerWidth - effectiveWidth - viewportPadding),
        );
        style.right = "auto";
    }

    if (resolvedPlacement === "bottom") {
        // Never place above the trigger — keep a clear gap below the button.
        style.top = preferredBottomTop;
    } else {
        style.top = preferredTopAnchor;
        style.transform = "translateY(-100%)";

        if (menuHeight > 0) {
            const minTop = menuHeight + viewportPadding;
            style.top = Math.max(minTop, Math.min(style.top, window.innerHeight - viewportPadding));
        }
    }

    if (matchTriggerWidth) {
        style.width = triggerRect.width;
    }

    return style;
}

export function useFloatingMenu({
    isOpen,
    onClose,
    placement = "auto",
    align = "right",
    offset = 8,
    matchTriggerWidth = false,
}: UseFloatingMenuOptions) {
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [menuStyle, setMenuStyle] = useState<FloatingMenuPositionStyle | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger || !isOpen) {
            return;
        }

        const menu = menuRef.current;
        const triggerRect = trigger.getBoundingClientRect();
        const menuWidth = menu?.offsetWidth ?? 0;
        const menuHeight = menu?.offsetHeight ?? 0;

        setMenuStyle(
            buildMenuStyle(triggerRect, menuWidth, menuHeight, {
                placement,
                align,
                offset,
                matchTriggerWidth,
            }),
        );
    }, [align, isOpen, matchTriggerWidth, offset, placement]);

    useLayoutEffect(() => {
        if (!isOpen) {
            setMenuStyle(null);
            return;
        }

        // First pass positions from the trigger; the menu is not mounted yet.
        updatePosition();

        let resizeObserver: ResizeObserver | null = null;

        // Remeasure after the portal mounts so width/height and alignment are accurate.
        const rafId = window.requestAnimationFrame(() => {
            updatePosition();

            const menu = menuRef.current;
            if (menu === null) {
                return;
            }

            resizeObserver = new ResizeObserver(updatePosition);
            resizeObserver.observe(menu);
        });

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.cancelAnimationFrame(rafId);
            resizeObserver?.disconnect();
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isOpen, updatePosition]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
                return;
            }

            onClose();
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    return {
        triggerRef,
        menuRef: menuRef as RefObject<HTMLDivElement | null>,
        menuStyle,
        isMounted,
    };
}
