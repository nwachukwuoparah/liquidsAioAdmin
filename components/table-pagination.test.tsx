import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TablePagination } from "@/components/table-pagination";
import { renderWithQueryClient } from "@/lib/test/render-with-query-client";

describe("TablePagination", () => {
    it("renders the rows-per-page dropdown and summary", () => {
        renderWithQueryClient(
            <TablePagination
                page={1}
                pageSize={10}
                totalCount={35}
                onPageChange={vi.fn()}
                onPageSizeChange={vi.fn()}
            />,
        );

        expect(screen.getByText("Rows per page")).toBeInTheDocument();
        expect(screen.getByTestId("table-pagination-page-size")).toHaveTextContent("10");
        expect(screen.getByText("Showing 1-10 of 35 results")).toBeInTheDocument();
    });

    it("changes page size through the custom dropdown", () => {
        const onPageSizeChange = vi.fn();

        renderWithQueryClient(
            <TablePagination
                page={1}
                pageSize={10}
                totalCount={35}
                onPageChange={vi.fn()}
                onPageSizeChange={onPageSizeChange}
            />,
        );

        fireEvent.click(screen.getByTestId("table-pagination-page-size"));
        fireEvent.click(screen.getByTestId("table-pagination-page-size-25"));

        expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });

    it("calls onPageChange when next is clicked", () => {
        const onPageChange = vi.fn();

        renderWithQueryClient(
            <TablePagination
                page={1}
                pageSize={10}
                totalCount={35}
                onPageChange={onPageChange}
                onPageSizeChange={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId("table-pagination-next"));

        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});
