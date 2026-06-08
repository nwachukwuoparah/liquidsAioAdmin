import type { SVGProps } from "react";

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14.375 5.625V1.25C14.375 1.08424 14.3092 0.925269 14.1919 0.808058C14.0747 0.690848 13.9158 0.625 13.75 0.625H1.25C1.08424 0.625 0.925269 0.690848 0.808058 0.808058C0.690848 0.925269 0.625 1.08424 0.625 1.25V5.625C0.625 13.125 7.5 15 7.5 15C7.5 15 14.375 13.125 14.375 5.625Z"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
