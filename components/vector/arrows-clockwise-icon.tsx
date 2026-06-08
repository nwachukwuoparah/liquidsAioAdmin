import type { SVGProps } from "react";

export function ArrowsClockwiseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.125 7.5H16.875V3.75"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.875 7.49978L14.6656 5.29041C13.3861 4.01095 11.6538 3.2875 9.84437 3.27697C8.03494 3.26644 6.29431 3.96968 5 5.23416"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.875 12.5H3.125V16.25"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.125 12.5L5.33437 14.7094C6.61388 15.9888 8.34621 16.7123 10.1556 16.7228C11.9651 16.7333 13.7057 16.0301 15 14.7656"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
