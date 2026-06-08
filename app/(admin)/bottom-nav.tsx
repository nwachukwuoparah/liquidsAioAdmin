"use client";

import { ADMIN_BOTTOM_NAV_ITEMS, isAdminNavItemActive } from "@/lib/admin-nav-items";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Main navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-[#0B0E0514] bg-[#FFFFFF] pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
            <div className="flex items-center justify-around px-2 py-2">
                {ADMIN_BOTTOM_NAV_ITEMS.map((item) => {
                    const isActive = isAdminNavItemActive(pathname, item.pathname);
                    const Icon = item.Icon;

                    return (
                        <Link
                            key={item.pathname}
                            href={item.pathname}
                            aria-label={item.label}
                            aria-current={isActive ? "page" : undefined}
                            className="flex min-w-0 flex-1 items-center justify-center px-1 py-1"
                        >
                            <span
                                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                                    isActive ? "bg-[#E2F5C8]" : "bg-transparent"
                                }`}
                            >
                                <Icon
                                    className={`h-6 w-6 shrink-0 ${
                                        isActive ? "text-[#518300]" : "text-[#0B0E05A3]"
                                    }`}
                                />
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
