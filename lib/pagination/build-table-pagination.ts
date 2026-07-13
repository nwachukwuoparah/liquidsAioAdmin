export const DEFAULT_TABLE_PAGE_SIZE_OPTIONS = ["10", "25"] as const;

export type PaginationPageItem = number | "ellipsis";

export interface TablePaginationMeta {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    rangeStart: number;
    rangeEnd: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

/** Computes pagination metadata for table footers. */
export function computeTablePaginationMeta({
    page,
    pageSize,
    totalCount,
}: {
    page: number;
    pageSize: number;
    totalCount: number;
}): TablePaginationMeta {
    const safePageSize = Math.max(1, pageSize);
    const totalPages = Math.max(1, Math.ceil(Math.max(0, totalCount) / safePageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * safePageSize + 1;
    const rangeEnd = totalCount === 0 ? 0 : Math.min(safePage * safePageSize, totalCount);

    return {
        page: safePage,
        pageSize: safePageSize,
        totalCount,
        totalPages,
        rangeStart,
        rangeEnd,
        hasPreviousPage: safePage > 1,
        hasNextPage: safePage < totalPages,
    };
}

/** Builds the page buttons shown in a paginated table footer. */
export function buildPaginationPageItems(
    currentPage: number,
    totalPages: number,
): PaginationPageItem[] {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: PaginationPageItem[] = [1];

    if (currentPage > 3) {
        items.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page += 1) {
        items.push(page);
    }

    if (currentPage < totalPages - 2) {
        items.push("ellipsis");
    }

    return items;
}

/** Formats the "Showing X-Y of Z results" label. */
export function formatTablePaginationSummary(meta: TablePaginationMeta): string {
    if (meta.totalCount === 0) {
        return "Showing 0 of 0 results";
    }

    return `Showing ${meta.rangeStart.toLocaleString()}-${meta.rangeEnd.toLocaleString()} of ${meta.totalCount.toLocaleString()} results`;
}
