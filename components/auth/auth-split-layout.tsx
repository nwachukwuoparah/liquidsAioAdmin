import type { ReactNode } from "react";

interface AuthSplitLayoutProps {
    children: ReactNode;
}

/** Full-width centered auth layout. */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#FFFFFF] px-6 py-10 sm:px-10">
            {children}
        </div>
    );
}
