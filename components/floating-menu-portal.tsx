"use client";

import { createPortal } from "react-dom";
import type { CSSProperties, HTMLAttributes, ReactNode, RefObject } from "react";

interface FloatingMenuPortalProps extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    isMounted: boolean;
    menuRef: RefObject<HTMLDivElement | null>;
    menuStyle: CSSProperties | null;
    children: ReactNode;
}

export function FloatingMenuPortal({
    isOpen,
    isMounted,
    menuRef,
    menuStyle,
    children,
    className,
    ...rest
}: FloatingMenuPortalProps) {
    if (!isOpen || !isMounted || !menuStyle) {
        return null;
    }

    return createPortal(
        <div ref={menuRef} className={className} style={menuStyle} {...rest}>
            {children}
        </div>,
        document.body,
    );
}
