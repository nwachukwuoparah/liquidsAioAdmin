import type { SVGProps } from "react";

/** Outline document icon for compliance uploaded files. */
export function FileTextIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                d="M11.875 2.5H4.375C3.668 2.5 3.125 3.043 3.125 3.75V16.25C3.125 16.957 3.668 17.5 4.375 17.5H15.625C16.332 17.5 16.875 16.957 16.875 16.25V7.5L11.875 2.5Z"
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.875 2.5V7.5H16.875"
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7.25 9.375H12.75"
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="round"
            />
            <path
                d="M7.25 11.875H10.625"
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="round"
            />
        </svg>
    );
}
