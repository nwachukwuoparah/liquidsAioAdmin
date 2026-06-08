import type { SVGProps } from "react";

type TrendIconProps = SVGProps<SVGSVGElement> & {
    direction?: "up" | "down";
};

export function TrendIcon({ direction = "up", className = "", ...props }: TrendIconProps) {
    return (
        <svg
            viewBox="0 0 16 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`h-2.5 w-4 shrink-0 ${direction === "down" ? "-scale-y-100" : ""} ${className}`}
            aria-hidden
            {...props}
        >
            <path
                d="M15.3307 0.666016L8.9974 6.99935L5.66406 3.66602L0.664062 8.66602M15.3307 4.66602V0.666016H11.3307"
                stroke="currentColor"
                strokeWidth={1.33333}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
