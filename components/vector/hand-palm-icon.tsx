import type { SVGProps } from "react";

export function HandPalmIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M10 2.5V8.75M12.5 4.375V8.75M7.5 4.375V9.375M5 6.875V11.25C5 14.7018 7.79822 17.5 11.25 17.5C14.7018 17.5 17.5 14.7018 17.5 11.25V10.625C17.5 9.58947 16.6605 8.75 15.625 8.75C15.3444 8.75 15.0805 8.81157 14.8438 8.92188M12.5 8.75C12.5 7.71447 11.6605 6.875 10.625 6.875M10 8.75C10 7.71447 9.16053 6.875 8.125 6.875M7.5 9.375C7.5 8.33947 6.66053 7.5 5.625 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
