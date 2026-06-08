import type { SVGProps } from "react";

export function ProfileUserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.0026 8.33317C11.8436 8.33317 13.3359 6.84079 13.3359 4.99984C13.3359 3.15889 11.8436 1.6665 10.0026 1.6665C8.16165 1.6665 6.66927 3.15889 6.66927 4.99984C6.66927 6.84079 8.16165 8.33317 10.0026 8.33317Z"
        stroke="currentColor"
        strokeWidth={1.25}
      />
      <path
        d="M16.6693 14.5832C16.6693 16.654 16.6693 18.3332 10.0026 18.3332C3.33594 18.3332 3.33594 16.654 3.33594 14.5832C3.33594 12.5123 6.32094 10.8332 10.0026 10.8332C13.6843 10.8332 16.6693 12.5123 16.6693 14.5832Z"
        stroke="currentColor"
        strokeWidth={1.25}
      />
    </svg>
  );
}
