"use client";

import ComplianceAuditFilters, {
    COMPLIANCE_AUDIT_ACTION_VALUE_MAP,
    COMPLIANCE_AUDIT_FILTER_BLUEPRINTS,
} from "@/components/compliance-audit-filters";
import { EmptyState } from "@/components/empty-state";
import ComplianceAuditLogDetailModal from "@/components/modals/compliance-audit-log-detail-modal";
import { ProfileAvatar } from "@/components/profile-avatar";
import SearchInput from "@/components/search-input";
import { AdminAsyncContent, DataTableSkeleton, ListRowsSkeleton } from "@/components/skeletons";
import Typography from "@/components/typography";
import { EyeIcon, SlidersHorizontalIcon } from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import { useAdminComplianceAuditLogs } from "@/lib/admin/hooks";
import { resolveComplianceDateRange } from "@/lib/admin/utilities/compliance-filter-params";
import { LIST_CARD_CLASS, SECTION_CARD_CLASS } from "@/lib/card-styles";
import type { AdminComplianceAuditLogRecord } from "@/lib/compliance/types/admin-compliance-audit.types";
import { useCallback, useMemo, useState } from "react";

function getActionBadgeClasses(action: string): { bg: string; text: string } {
    switch (action) {
        case "review:approve":
        case "restore":
        case "add":
        case "claim":
            return { bg: "bg-[#00A34114]", text: "!text-[#00A341]" };
        case "review:reject":
        case "delete":
        case "revoke":
            return { bg: "bg-[#CC292914]", text: "!text-[#CC2929]" };
        case "review:suspend":
        case "unclaim":
            return { bg: "bg-[#DC680314]", text: "!text-[#DC6803]" };
        case "update":
        case "submit":
        case "resend":
            return { bg: "bg-[#2563EB14]", text: "!text-[#2563EB]" };
        default:
            return { bg: "bg-[#0B0E050A]", text: "!text-[#0B0E05CC]" };
    }
}

function ComplianceAuditLoadMoreButton({
    hasNext,
    isLoading,
    onClick,
}: {
    hasNext: boolean;
    isLoading: boolean;
    onClick: () => void;
}) {
    return (
        <div className="flex items-center justify-center border-t border-[#0B0E0514] bg-[#FFFFFF] py-5 md:rounded-b-2xl">
            <button
                type="button"
                disabled={!hasNext || isLoading}
                onClick={onClick}
                className={`${hasNext && !isLoading ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-50"} flex items-center gap-2 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] px-5 py-2 shadow-card transition-colors hover:bg-[#0B0E050A]`}
            >
                <Typography type="text14" fontWeight={600} className="text-slate-700">
                    {isLoading ? "Loading..." : "See more"}
                </Typography>
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>
    );
}

export default function ComplianceAuditLogs() {
    const { showModal } = useModal();
    const [adminIdQuery, setAdminIdQuery] = useState("");
    const [filterParams, setFilterParams] = useState<Record<string, string>>({});

    const auditQueryParams = useMemo(() => {
        const { dateRange: _dateRange, ...apiParams } = filterParams;
        return {
            ...apiParams,
            ...(adminIdQuery.trim() ? { admin_id: adminIdQuery.trim() } : {}),
        };
    }, [adminIdQuery, filterParams]);

    const auditLogsQuery = useAdminComplianceAuditLogs(auditQueryParams);

    const tableRows = useMemo(() => {
        const pages = auditLogsQuery.data?.pages ?? [];
        let serial = 0;

        return pages.flatMap((page) =>
            page.results.map((row) => {
                serial += 1;
                return { ...row, sn: `${serial}.` };
            }),
        );
    }, [auditLogsQuery.data]);

    const hasNextPage = auditLogsQuery.hasNextPage ?? false;

    const selectedAuditFilters = useMemo<Record<string, string | undefined>>(
        () => ({
            action: filterParams.action
                ? Object.entries(COMPLIANCE_AUDIT_ACTION_VALUE_MAP).find(
                      ([, value]) => value === filterParams.action,
                  )?.[0]
                : undefined,
            dateRange: filterParams.dateRange,
        }),
        [filterParams],
    );

    const handleAuditFilterChange = useCallback((filterId: string, value: string) => {
        setFilterParams((prevParams) => {
            const updatedParams = { ...prevParams };
            const isDefaultValue =
                value === "" ||
                value.toLowerCase() === "all actions" ||
                value.toLowerCase() === "all time";

            if (filterId === "dateRange") {
                delete updatedParams.start;
                delete updatedParams.end;
                delete updatedParams.dateRange;

                if (!isDefaultValue) {
                    updatedParams.dateRange = value;
                    const { start, end } = resolveComplianceDateRange(value);
                    if (start) {
                        updatedParams.start = start;
                    }
                    if (end) {
                        updatedParams.end = end;
                    }
                }

                return updatedParams;
            }

            if (isDefaultValue) {
                delete updatedParams[filterId];
            } else if (filterId === "action") {
                updatedParams.action = COMPLIANCE_AUDIT_ACTION_VALUE_MAP[value] ?? value;
            } else {
                updatedParams[filterId] = value.trim();
            }

            return updatedParams;
        });
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filterParams.action) count += 1;
        if (filterParams.start || filterParams.end) count += 1;
        if (adminIdQuery.trim()) count += 1;
        return count || 1;
    }, [adminIdQuery, filterParams]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !auditLogsQuery.isFetchingNextPage) {
            void auditLogsQuery.fetchNextPage();
        }
    }, [auditLogsQuery, hasNextPage]);

    const openLogDetails = useCallback(
        (log: AdminComplianceAuditLogRecord) => {
            showModal({
                content: <ComplianceAuditLogDetailModal log={log} />,
                panelClassName: "w-full max-w-[720px]",
            });
        },
        [showModal],
    );

    return (
        <>
            <div className="flex flex-col gap-3 px-4 pb-6 pt-4 md:hidden">
                <div className="flex items-center gap-2.5">
                    <SearchInput
                        containerClassName="flex-1"
                        value={adminIdQuery}
                        onChange={(event) => setAdminIdQuery(event.target.value)}
                        placeholder="Filter by admin ID..."
                        className="rounded-2xl py-3 focus:border-[#0B0E0514]"
                    />
                    <button
                        type="button"
                        aria-label="Open audit filters"
                        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] shadow-card"
                    >
                        <SlidersHorizontalIcon className="h-5 w-5 text-[#343330]" />
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-card">
                            {activeFiltersCount}
                        </span>
                    </button>
                </div>

                <AdminAsyncContent
                    isLoading={auditLogsQuery.isLoading}
                    isEmpty={tableRows.length === 0}
                    loadingFallback={<ListRowsSkeleton rows={5} />}
                    emptyFallback={<EmptyState title="No audit trail events found" />}
                >
                    <div className="flex flex-col gap-2.5">
                        {tableRows.map((row) => {
                            const actionBadge = getActionBadgeClasses(row.action ?? "");

                            return (
                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => openLogDetails(row)}
                                    className={`w-full p-4 text-left ${LIST_CARD_CLASS} rounded-xl`}
                                >
                                    <div className="space-y-2.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Typography type="text12" fontWeight={700} className="!text-[#0B0E05A3]">
                                                    {row.sn}
                                                </Typography>
                                                <span className={`rounded-md px-2 py-0.5 ${actionBadge.bg}`}>
                                                    <Typography type="text12" fontWeight={600} className={actionBadge.text}>
                                                        {row.actionLabel}
                                                    </Typography>
                                                </span>
                                                <Typography type="text14" fontWeight={600} className="truncate !text-[#0B0E05]">
                                                    {row.subjectLabel}
                                                </Typography>
                                            </div>
                                            <Typography type="text12" fontWeight={500} className="shrink-0 !text-[#0B0E05A3]">
                                                {row.createdAtLabel}
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <ProfileAvatar
                                                    name={row.targetUserName}
                                                    email={row.targetUserEmail}
                                                    imageUrl={row.targetUserAvatarUrl}
                                                    size="sm"
                                                />
                                                <div className="min-w-0">
                                                    <Typography type="text14" fontWeight={600} className="truncate !text-[#0B0E05]">
                                                        {row.targetUserName}
                                                    </Typography>
                                                    <Typography type="text12" fontWeight={400} className="truncate !text-[#0B0E05A3]">
                                                        By {row.actorName}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <EyeIcon className="h-4 w-4 shrink-0 text-[#0B0E05A3]" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </AdminAsyncContent>
            </div>

            {!auditLogsQuery.isLoading && tableRows.length > 0 ? (
                <div className="md:hidden">
                    <ComplianceAuditLoadMoreButton
                        hasNext={hasNextPage}
                        isLoading={auditLogsQuery.isFetchingNextPage}
                        onClick={handleLoadMore}
                    />
                </div>
            ) : null}

            <div className="hidden md:block">
                <div className="border-b border-[#0B0E0514] p-6">
                    <div className={`p-4 ${SECTION_CARD_CLASS}`}>
                        <ComplianceAuditFilters
                            adminIdQuery={adminIdQuery}
                            onAdminIdQueryChange={setAdminIdQuery}
                            filters={COMPLIANCE_AUDIT_FILTER_BLUEPRINTS}
                            selectedValues={selectedAuditFilters}
                            onFilterChange={handleAuditFilterChange}
                        />
                    </div>
                </div>

                <div className="w-full">
                    <table className="w-full table-fixed border-collapse text-left">
                        <colgroup>
                            <col className="w-[56px]" />
                            <col className="w-[18%]" />
                            <col className="w-[22%]" />
                            <col className="w-[20%]" />
                            <col className="w-[24%]" />
                            <col className="w-[72px]" />
                        </colgroup>
                        <thead>
                            <tr className="border-b border-[#0B0E0514] bg-[#0B0E050A]">
                                {["S/N", "When", "Event", "Actor", "Target", ""].map((head, index) => (
                                    <th key={`${head}-${index}`} className="px-4 py-3.5 first:pl-6 last:pr-6">
                                        <Typography type="text12" fontWeight={600} className="uppercase tracking-[0.04em] text-slate-500">
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#0B0E0514]">
                            <AdminAsyncContent
                                isLoading={auditLogsQuery.isLoading}
                                isEmpty={tableRows.length === 0}
                                loadingFallback={
                                    <tr>
                                        <td colSpan={6}>
                                            <DataTableSkeleton rows={6} columns={6} />
                                        </td>
                                    </tr>
                                }
                                emptyFallback={
                                    <tr>
                                        <td colSpan={6}>
                                            <EmptyState title="No audit trail events found" />
                                        </td>
                                    </tr>
                                }
                            >
                                {tableRows.map((row) => {
                                    const actionBadge = getActionBadgeClasses(row.action ?? "");

                                    return (
                                        <tr key={row.id} className="transition-colors hover:bg-[#0B0E050A]">
                                            <td className="px-4 py-3.5 first:pl-6 align-middle">
                                                <Typography type="text14" fontWeight={700} className="text-slate-900">
                                                    {row.sn}
                                                </Typography>
                                            </td>

                                            <td className="px-4 py-3.5 align-middle">
                                                <Typography type="text14" fontWeight={500} className="truncate text-slate-700">
                                                    {row.createdAtLabel}
                                                </Typography>
                                            </td>

                                            <td className="px-4 py-3.5 align-middle">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className={`inline-flex shrink-0 rounded-md px-2 py-0.5 ${actionBadge.bg}`}>
                                                        <Typography type="text12" fontWeight={600} className={actionBadge.text}>
                                                            {row.actionLabel}
                                                        </Typography>
                                                    </span>
                                                    <Typography type="text14" fontWeight={600} className="truncate text-slate-800">
                                                        {row.subjectLabel}
                                                    </Typography>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 align-middle">
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <ProfileAvatar
                                                        name={row.actorName}
                                                        email={row.actorEmail}
                                                        imageUrl={row.actorAvatarUrl}
                                                        size="sm"
                                                    />
                                                    <Typography type="text14" fontWeight={600} className="truncate text-slate-800">
                                                        {row.actorName}
                                                    </Typography>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 align-middle">
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <ProfileAvatar
                                                        name={row.targetUserName}
                                                        email={row.targetUserEmail}
                                                        imageUrl={row.targetUserAvatarUrl}
                                                        size="sm"
                                                    />
                                                    <Typography type="text14" fontWeight={600} className="truncate text-slate-800">
                                                        {row.targetUserName}
                                                    </Typography>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 last:pr-6 align-middle text-right">
                                                <button
                                                    type="button"
                                                    aria-label="View audit details"
                                                    onClick={() => openLogDetails(row)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B0E0514] bg-white transition-colors hover:bg-slate-50"
                                                >
                                                    <EyeIcon className="h-4 w-4 text-[#0B0E05]" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </AdminAsyncContent>
                        </tbody>
                    </table>
                </div>

                {!auditLogsQuery.isLoading && tableRows.length > 0 ? (
                    <ComplianceAuditLoadMoreButton
                        hasNext={hasNextPage}
                        isLoading={auditLogsQuery.isFetchingNextPage}
                        onClick={handleLoadMore}
                    />
                ) : null}
            </div>
        </>
    );
}
