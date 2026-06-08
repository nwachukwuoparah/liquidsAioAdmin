import type { SVGProps } from "react";

export function StatusCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.125 15.625C12.2671 15.625 15.625 12.2671 15.625 8.125C15.625 3.98286 12.2671 0.625 8.125 0.625C3.98286 0.625 0.625 3.98286 0.625 8.125C0.625 12.2671 3.98286 15.625 8.125 15.625Z"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeMiterlimit={10}
      />
    </svg>
  );
}
