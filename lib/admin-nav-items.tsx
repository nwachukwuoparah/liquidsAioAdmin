import {
    AllUsersIcon,
    BuyerRfqsIcon,
    ComplianceIcon,
    InventoryIcon,
    OrdersIcon,
    OverviewIcon,
    SettingsIcon,
} from "@/components/vector";
import type { ComponentType, SVGProps } from "react";

export type AdminNavIcon = ComponentType<SVGProps<SVGSVGElement>>;

/** Which live queue count drives the red nav badge, if any. */
export type AdminNavBadgeKey = "compliance" | "rfqs" | "inventory";

export type AdminNavItem = {
    label: string;
    badgeKey: AdminNavBadgeKey | null;
    pathname: string;
    Icon: AdminNavIcon;
    dividerAfter?: boolean;
    showInBottomNav?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    {
        label: "Overview",
        badgeKey: null,
        pathname: "/overview",
        Icon: OverviewIcon,
        showInBottomNav: true,
    },
    {
        label: "Compliance",
        badgeKey: "compliance",
        pathname: "/compliance",
        Icon: ComplianceIcon,
        showInBottomNav: true,
    },
    {
        label: "Buyer RFQs",
        badgeKey: "rfqs",
        pathname: "/rfqs",
        Icon: BuyerRfqsIcon,
        dividerAfter: true,
        showInBottomNav: true,
    },
    {
        label: "All users",
        badgeKey: null,
        pathname: "/users",
        Icon: AllUsersIcon,
        showInBottomNav: true,
    },
    {
        label: "All Lots",
        badgeKey: "inventory",
        pathname: "/inventory",
        Icon: InventoryIcon,
        showInBottomNav: true,
    },
    {
        label: "Orders",
        badgeKey: null,
        pathname: "/orders",
        Icon: OrdersIcon,
        dividerAfter: true,
        showInBottomNav: true,
    },
    {
        label: "Settings",
        badgeKey: null,
        pathname: "/settings",
        Icon: SettingsIcon,
        showInBottomNav: false,
    },
];

export const ADMIN_BOTTOM_NAV_ITEMS = ADMIN_NAV_ITEMS.filter((item) => item.showInBottomNav);

export function isAdminNavItemActive(pathname: string, itemPathname: string): boolean {
    return pathname === itemPathname || pathname.startsWith(`${itemPathname}/`);
}
