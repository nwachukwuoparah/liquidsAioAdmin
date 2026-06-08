const ADMIN_PAGE_TITLES = [
    { prefix: "/settings", title: "Settings" },
    { prefix: "/overview", title: "Overview" },
    { prefix: "/compliance", title: "Compliance" },
    { prefix: "/rfqs", title: "Buyer RFQs" },
    { prefix: "/users", title: "All users" },
    { prefix: "/inventory", title: "Inventory" },
    { prefix: "/orders", title: "Orders" },
] as const;

export function getAdminPageTitle(pathname: string): string {
    const normalized = pathname.split("?")[0].replace(/\/$/, "") || "/";

    const match = ADMIN_PAGE_TITLES.find(
        ({ prefix }) => normalized === prefix || normalized.startsWith(`${prefix}/`),
    );

    return match?.title ?? "Overview";
}
