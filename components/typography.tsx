"use client";


import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";

interface ThemedTextProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    type?: "text12" | "text14" | "text16" | "text20" | "text24" | "text28" | "text32" | "text48";
    fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    italic?: boolean;
    usemomo?: boolean;
    letterSpacing?: string;
    truncate?: boolean;
    maxLength?: number;
    lines?: number;
    suppressHydrationWarning?: boolean;
}

const typeClasses: Record<string, string> = {
    text12: "text-[12px]",
    text14: "text-[14px]",
    text16: "text-[16px]",
    text20: "text-[20px]",
    text24: "text-[24px]",
    text28: "text-[28px]",
    text32: "text-[32px]",
    text48: "text-[48px]",
};

const weightClasses: Record<number, string> = {
    100: "font-thin",
    200: "font-extralight",
    300: "font-light",
    400: "font-normal",
    500: "font-medium",
    600: "font-semibold",
    700: "font-bold",
    800: "font-extrabold",
    900: "font-black",
};

// Recursive helper pulled outside rendering scope
const getPlainText = (node: React.ReactNode): string => {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(getPlainText).join("");
    if (React.isValidElement(node)) {
        if (node.type === "br") return "\n";
        return getPlainText((node as React.ReactElement<any>).props.children);
    }
    return "";
};

const Typography: React.FC<ThemedTextProps> = ({
    onClick,
    className = "",
    type = "text14",
    fontWeight,
    italic = false,
    usemomo = false,
    letterSpacing,
    truncate = false,
    maxLength = 60,
    lines = 1,
    suppressHydrationWarning = false,
    children,
    ...rest
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [isMounted, setIsMounted] = useState(false);

    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 1. Memoize expensive text string conversions
    const fullText = useMemo(() => getPlainText(children), [children]);

    const hasExceededLength = fullText.length > maxLength;
    const shouldClampVisually = truncate;
    const showTooltipOnHover = truncate && hasExceededLength;

    // 2. Handle dynamically updating recalculations for resize and window scrolls
    const updateTooltipPosition = useCallback(() => {
        if (showTooltip && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setTooltipStyle({
                top: `${rect.top + window.scrollY - 12}px`,
                left: `${rect.left + window.scrollX + rect.width / 2}px`,
                transform: "translate(-50%, -100%)",
            });
        }
    }, [showTooltip]);

    useEffect(() => {
        if (showTooltip) {
            updateTooltipPosition();
            window.addEventListener("resize", updateTooltipPosition);
            window.addEventListener("scroll", updateTooltipPosition, { passive: true });
        }
        return () => {
            window.removeEventListener("resize", updateTooltipPosition);
            window.removeEventListener("scroll", updateTooltipPosition);
        };
    }, [showTooltip, updateTooltipPosition]);

    const handleEnter = () => {
        if (!showTooltipOnHover) return;
        timeoutRef.current = setTimeout(() => setShowTooltip(true), 150);
    };

    const handleLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowTooltip(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // 3. Assemble unified styles object to avoid Tailwind syntax breakages
    const spanStyle = useMemo(() => {
        let styles: React.CSSProperties = {};
        if (letterSpacing) styles.letterSpacing = letterSpacing;

        if (shouldClampVisually && lines > 1) {
            styles = {
                ...styles,
                display: "-webkit-box",
                WebkitLineClamp: lines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
            };
        }
        return styles;
    }, [letterSpacing, shouldClampVisually, lines]);

    // Render Portal element inside body tree only when client is live
    const renderTooltipPortal = () => {
        if (!isMounted || !showTooltipOnHover || !showTooltip) return null;

        return createPortal(
            <div
                className="fixed z-[2147483000] px-4 py-3 bg-[#FFFFFF] text-[#0B0E05] text-sm rounded-lg shadow-card whitespace-pre-wrap break-words w-[270px] pointer-events-none select-text transition-opacity duration-150 ease-out"
                style={tooltipStyle}
            >
                {fullText}
            </div>,
            document.body
        );
    };

    const baseFontClass = usemomo ? "font-momo" : "font-mulish";
    const weightClass = fontWeight ? weightClasses[fontWeight] || "" : "";

    return (
        <>
            <div
                ref={triggerRef}
                className={`relative max-w-full ${shouldClampVisually ? "block w-full min-w-0" : "inline-block"}`}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onClick={onClick}
                suppressHydrationWarning={suppressHydrationWarning}
                {...rest}
            >
                <span
                    suppressHydrationWarning={suppressHydrationWarning}
                    className={`
            text-[#0B0E05CC]
            ${typeClasses[type] || ""}
            ${baseFontClass}
            ${weightClass}
            ${italic ? "italic" : ""}
            ${className}
            ${shouldClampVisually && lines === 1 ? "block min-w-0 truncate" : ""}
          `}
                    style={spanStyle}
                >
                    {/* Letting CSS line-clamping and wrapping natively do its job instead of slicing layout characters
            on the client prevents unexpected content shifts during server rendering handshakes.
          */}
                    {children}
                </span>
            </div>

            {renderTooltipPortal()}
        </>
    );
};

export default Typography;