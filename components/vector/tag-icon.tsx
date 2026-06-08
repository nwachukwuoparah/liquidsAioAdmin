import type { SVGProps } from "react";

export function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.30781 10.8078C3.19082 10.6907 3.12508 10.5319 3.125 10.3664V3.125H10.3664C10.5319 3.12508 10.6907 3.19082 10.8078 3.30781L18.5672 11.0672C18.6843 11.1844 18.7501 11.3433 18.7501 11.509C18.7501 11.6747 18.6843 11.8336 18.5672 11.9508L11.9531 18.5672C11.8359 18.6843 11.677 18.7501 11.5113 18.7501C11.3456 18.7501 11.1867 18.6843 11.0695 18.5672L3.30781 10.8078Z"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5625 7.5C7.08027 7.5 7.5 7.08027 7.5 6.5625C7.5 6.04473 7.08027 5.625 6.5625 5.625C6.04473 5.625 5.625 6.04473 5.625 6.5625C5.625 7.08027 6.04473 7.5 6.5625 7.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
