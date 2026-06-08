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

export type AdminNavItem = {
    label: string;
    badge: string | null;
    pathname: string;
    Icon: AdminNavIcon;
    dividerAfter?: boolean;
    showInBottomNav?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    {
        label: "Overview",
        badge: null,
        pathname: "/overview",
        Icon: OverviewIcon,
        showInBottomNav: true,
    },
    {
        label: "Compliance",
        badge: "13",
        pathname: "/compliance",
        Icon: ComplianceIcon,
        showInBottomNav: true,
    },
    {
        label: "Buyer RFQs",
        badge: "99+",
        pathname: "/rfqs",
        Icon: BuyerRfqsIcon,
        dividerAfter: true,
        showInBottomNav: true,
    },
    {
        label: "All users",
        badge: null,
        pathname: "/users",
        Icon: AllUsersIcon,
        showInBottomNav: true,
    },
    {
        label: "Inventory",
        badge: null,
        pathname: "/inventory",
        Icon: InventoryIcon,
        showInBottomNav: true,
    },
    {
        label: "Orders",
        badge: null,
        pathname: "/orders",
        Icon: OrdersIcon,
        dividerAfter: true,
        showInBottomNav: true,
    },
    {
        label: "Settings",
        badge: null,
        pathname: "/settings",
        Icon: SettingsIcon,
        showInBottomNav: false,
    },
];

export const ADMIN_BOTTOM_NAV_ITEMS = ADMIN_NAV_ITEMS.filter((item) => item.showInBottomNav);

export function isAdminNavItemActive(pathname: string, itemPathname: string): boolean {
    return pathname === itemPathname || pathname.startsWith(`${itemPathname}/`);
}
