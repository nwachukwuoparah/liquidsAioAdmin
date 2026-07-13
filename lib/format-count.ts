export function formatCount(count: number): string {
    if (count > 99) {
        return "99+";
    }

    return String(count);
}

/** Formats a sidebar/nav badge count, hiding zero and missing values. */
export function formatNavBadgeCount(count: number | null | undefined): string | null {
    if (count == null || count <= 0) {
        return null;
    }

    return formatCount(count);
}
