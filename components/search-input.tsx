"use client";

import { MagnifyingGlassIcon } from "@/components/vector";
import type { InputHTMLAttributes } from "react";

type SearchInputSize = "default" | "compact";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string;
    size?: SearchInputSize;
}

const sizeClasses: Record<SearchInputSize, { icon: string; input: string }> = {
    default: {
        icon: "left-3.5 h-5 w-5",
        input: "rounded-xl py-2 pl-10 pr-4 text-sm",
    },
    compact: {
        icon: "left-2.5 h-4 w-4",
        input: "rounded-lg py-1.5 pl-8 pr-2 text-xs",
    },
};

export default function SearchInput({
    className = "",
    containerClassName = "w-full",
    size = "default",
    ...props
}: SearchInputProps) {
    const styles = sizeClasses[size];

    return (
        <div className={`relative ${containerClassName}`}>
            <MagnifyingGlassIcon
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#343330] ${styles.icon}`}
            />
            <input
                type="text"
                {...props}
                className={`w-full border border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05] outline-none transition-all placeholder:text-[#0B0E05A3] focus:border-[#518300] ${styles.input} ${className}`}
            />
        </div>
    );
}
