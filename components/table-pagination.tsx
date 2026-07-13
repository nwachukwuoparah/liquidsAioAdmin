"use client";

import { CustomDropdown } from "@/components/custom-dropdown";
import Typography from "@/components/typography";
import {
    buildPaginationPageItems,
    computeTablePaginationMeta,
    DEFAULT_TABLE_PAGE_SIZE_OPTIONS,
    formatTablePaginationSummary,
} from "@/lib/pagination/build-table-pagination";

export interface TablePaginationProps {
    page: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: readonly string[];
    disabled?: boolean;
}

/**
 * Shared table footer pagination with rows-per-page dropdown and page controls.
 */
export function TablePagination({
    page,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_TABLE_PAGE_SIZE_OPTIONS,
    disabled = false,
}: TablePaginationProps) {
    const meta = computeTablePaginationMeta({ page, pageSize, totalCount });
    const pageItems = buildPaginationPageItems(meta.page, meta.totalPages);
    const dropdownOptions = pageSizeOptions.map((option) => ({
        value: option,
        label: option,
    }));

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#0B0E0514] bg-[#FFFFFF] px-6 py-4">
            <div className="flex min-w-0 items-center gap-2">
                <Typography type="text12" fontWeight={600} className="whitespace-nowrap text-[#0B0E05]">
                    Rows per page
                </Typography>
                <div className="w-[4.75rem] shrink-0">
                    <CustomDropdown
                        value={String(pageSize)}
                        options={dropdownOptions}
                        onChange={(value) => onPageSizeChange(Number(value))}
                        variant="compact"
                        placement="auto"
                        disabled={disabled}
                        ariaLabel="Rows per page"
                        testId="table-pagination-page-size"
                        menuTestId="table-pagination-page-size-menu"
                        optionTestIdPrefix="table-pagination-page-size"
                    />
                </div>
                <Typography type="text12" fontWeight={500} className="ml-2 truncate text-[#0B0E05A3]">
                    {formatTablePaginationSummary(meta)}
                </Typography>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05A3] shadow-none disabled:opacity-40"
                    disabled={disabled || !meta.hasPreviousPage}
                    aria-label="Previous page"
                    data-testid="table-pagination-previous"
                    onClick={() => onPageChange(meta.page - 1)}
                >
                    <span className="mb-0.5 block h-2 w-2 rotate-45 border-b border-l border-current" />
                </button>

                {pageItems.map((item, index) =>
                    item === "ellipsis" ? (
                        <Typography
                            key={`ellipsis-${index}`}
                            type="text12"
                            fontWeight={600}
                            className="shrink-0 px-1 text-[#0B0E05]"
                        >
                            ...
                        </Typography>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 ${
                                item === meta.page
                                    ? "bg-[#B1EC52]"
                                    : "hover:bg-[#0B0E050A]"
                            }`}
                            aria-label={`Page ${item}`}
                            aria-current={item === meta.page ? "page" : undefined}
                            data-testid={`table-pagination-page-${item}`}
                            disabled={disabled}
                            onClick={() => onPageChange(item)}
                        >
                            <Typography type="text12" fontWeight={item === meta.page ? 700 : 600} className="text-[#0B0E05]">
                                {item}
                            </Typography>
                        </button>
                    ),
                )}

                {meta.totalPages > 5 ? (
                    <button
                        type="button"
                        className="rounded-lg px-2 py-1 hover:bg-[#0B0E050A] disabled:opacity-40"
                        disabled={disabled}
                        aria-label={`Go to page ${meta.totalPages}`}
                        data-testid="table-pagination-last-page"
                        onClick={() => onPageChange(meta.totalPages)}
                    >
                        <Typography type="text12" fontWeight={600} className="whitespace-nowrap text-[#0B0E05]">
                            {meta.totalPages.toLocaleString()} pages
                        </Typography>
                    </button>
                ) : null}

                <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05] shadow-none disabled:opacity-40"
                    disabled={disabled || !meta.hasNextPage}
                    aria-label="Next page"
                    data-testid="table-pagination-next"
                    onClick={() => onPageChange(meta.page + 1)}
                >
                    <span className="mb-0.5 block h-2 w-2 rotate-45 border-r border-t border-current" />
                </button>
            </div>
        </div>
    );
}
