import type { SVGProps } from "react";

export function ApproveCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M0.625 6.25L5 10.625L15 0.625"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
