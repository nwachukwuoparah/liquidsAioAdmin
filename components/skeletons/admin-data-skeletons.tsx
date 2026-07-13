import type { ReactNode } from "react";
import { CARD_BG_CLASS } from "@/lib/card-styles";

interface SkeletonProps {
    className?: string;
}

/** Base animated skeleton block. */
export function Skeleton({ className = "" }: SkeletonProps) {
    return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-[#0B0E050A] ${className}`} />;
}

interface StatCardsSkeletonProps {
    count?: number;
    columnsClassName?: string;
    /** When true, matches the taller engagement stat cards on the users page. */
    tall?: boolean;
}

/** Skeleton grid for dashboard stat cards. */
export function StatCardsSkeleton({
    count = 4,
    columnsClassName = "grid grid-cols-2 gap-3.5 md:grid-cols-4",
    tall = false,
}: StatCardsSkeletonProps) {
    return (
        <div className={columnsClassName} data-testid="stat-cards-skeleton">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`rounded-2xl border border-[#0B0E0514] p-4 shadow-card ${CARD_BG_CLASS} ${tall ? "h-28" : ""}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className={`${tall ? "h-8 w-24" : "h-7 w-20"}`} />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                    </div>
                    {tall ? <Skeleton className="mt-4 h-3 w-24" /> : null}
                </div>
            ))}
        </div>
    );
}

interface MetricCardsSkeletonProps {
    count?: number;
    className?: string;
}

/** Skeleton for compact metric summary cards such as team stats. */
export function MetricCardsSkeleton({ count = 2, className = "" }: MetricCardsSkeletonProps) {
    return (
        <div
            className={`flex flex-col gap-4 sm:flex-row ${className}`}
            data-testid="metric-cards-skeleton"
        >
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`w-full rounded-2xl border border-[#0B0E0514] p-4 shadow-card sm:max-w-[260px] ${CARD_BG_CLASS}`}
                >
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <Skeleton className="mt-4 h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-44" />
                </div>
            ))}
        </div>
    );
}

interface ChartPanelSkeletonProps {
    className?: string;
}

/** Skeleton for overview chart panels. */
export function ChartPanelSkeleton({ className = "" }: ChartPanelSkeletonProps) {
    return (
        <div
            className={`grid grid-cols-1 gap-6 lg:grid-cols-3 ${className}`}
            data-testid="chart-panel-skeleton"
        >
            <div className={`rounded-2xl border border-[#0B0E0514] p-5 shadow-card lg:col-span-2 ${CARD_BG_CLASS}`}>
                <Skeleton className="mb-4 h-5 w-40" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className={`rounded-2xl border border-[#0B0E0514] p-5 shadow-card ${CARD_BG_CLASS}`}>
                <Skeleton className="mb-4 h-5 w-36" />
                <Skeleton className="mx-auto h-52 w-52 rounded-full" />
                <div className="mt-6 space-y-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        </div>
    );
}

interface DataTableSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
    /** When false, skips the fake header row (use inside tables that already have headers). */
    showHeader?: boolean;
}

/** Skeleton for tabular admin lists. */
export function DataTableSkeleton({
    rows = 6,
    columns = 5,
    className = "",
    showHeader = true,
}: DataTableSkeletonProps) {
    return (
        <div className={`space-y-4 p-4 md:p-6 ${className}`} data-testid="data-table-skeleton">
            {showHeader ? (
                <div
                    className="hidden gap-4 md:grid"
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: columns }).map((_, index) => (
                        <Skeleton key={`header-${index}`} className="h-4 w-full" />
                    ))}
                </div>
            ) : null}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className={`grid gap-4 rounded-2xl border border-[#0B0E0514] px-4 py-5 shadow-card md:items-center ${CARD_BG_CLASS}`}
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: columns }).map((_, columnIndex) => (
                        <Skeleton key={`${rowIndex}-${columnIndex}`} className="h-4 w-full" />
                    ))}
                </div>
            ))}
        </div>
    );
}

interface TableRowsSkeletonProps {
    rows?: number;
    columns?: number;
}

/** Skeleton rows that match a real table body (for use inside `<tbody>`). */
export function TableRowsSkeleton({ rows = 5, columns = 6 }: TableRowsSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} data-testid="table-row-skeleton">
                    {Array.from({ length: columns }).map((_, columnIndex) => (
                        <td key={`${rowIndex}-${columnIndex}`} className="px-4 py-4 align-middle">
                            <Skeleton
                                className={`h-4 ${columnIndex === 1 ? "w-28" : columnIndex === columns - 1 ? "ml-auto h-8 w-8 rounded-lg" : "w-full"}`}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

interface ListRowsSkeletonProps {
    rows?: number;
    className?: string;
}

/** Skeleton for mobile card-style list rows. */
export function ListRowsSkeleton({ rows = 5, className = "" }: ListRowsSkeletonProps) {
    return (
        <div className={`space-y-4 ${className}`} data-testid="list-rows-skeleton">
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className={`flex items-center gap-3 rounded-2xl border border-[#0B0E0514] p-4 shadow-card ${CARD_BG_CLASS}`}
                >
                    <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

interface FormSectionSkeletonProps {
    fields?: number;
    className?: string;
}

/** Skeleton for settings-style form sections. */
export function FormSectionSkeleton({ fields = 3, className = "" }: FormSectionSkeletonProps) {
    return (
        <div className={`space-y-4 ${className}`} data-testid="form-section-skeleton">
            {Array.from({ length: fields }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-2xl" />
            ))}
        </div>
    );
}

/** Skeleton matching the My profile card layout (avatar, action, name, phone). */
export function ProfileSettingsSkeleton() {
    return (
        <div className="space-y-6" data-testid="profile-settings-skeleton" aria-busy="true">
            <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex flex-col items-start gap-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-9 w-[7.5rem] rounded-xl" />
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        </div>
    );
}

/** Skeleton matching the General settings form layout. */
export function GeneralSettingsSkeleton() {
    return (
        <div className="space-y-6" data-testid="general-settings-skeleton" aria-busy="true">
            <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full max-w-md" />
                <Skeleton className="h-3 w-4/5 max-w-sm" />
                <Skeleton className="mt-1 h-12 w-full rounded-xl" />
            </div>

            <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full max-w-md" />
                <Skeleton className="h-3 w-3/4 max-w-sm" />
                <Skeleton className="mt-1 h-12 w-full rounded-xl" />
            </div>
        </div>
    );
}

interface AdminAsyncContentProps {
    isLoading: boolean;
    isEmpty?: boolean;
    loadingFallback: ReactNode;
    emptyFallback?: ReactNode;
    children: ReactNode;
}

/** Switches between loading skeleton, empty state, and loaded content. */
export function AdminAsyncContent({
    isLoading,
    isEmpty = false,
    loadingFallback,
    emptyFallback = null,
    children,
}: AdminAsyncContentProps) {
    if (isLoading) {
        return <>{loadingFallback}</>;
    }

    if (isEmpty && emptyFallback) {
        return <>{emptyFallback}</>;
    }

    return <>{children}</>;
}

interface AdminQueryStateProps {
    isError: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    children: ReactNode;
}

/** Inline error state with optional retry for admin data sections. */
export function AdminQueryState({
    isError,
    errorMessage = "Unable to load data. Please try again.",
    onRetry,
    children,
}: AdminQueryStateProps) {
    if (!isError) {
        return children;
    }

    return (
        <div className="rounded-2xl border border-[#CC292929] bg-[#CC292914] p-6 text-center">
            <p className="text-sm font-semibold text-[#CC2929]">{errorMessage}</p>
            {onRetry ? (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 rounded-xl bg-[#0B0E05] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0E05CC]"
                >
                    Try again
                </button>
            ) : null}
        </div>
    );
}
