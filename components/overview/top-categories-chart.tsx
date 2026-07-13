"use client";

import React, { useMemo, useState } from "react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Sector,
    Tooltip,
    type PieSectorShapeProps,
} from "recharts";
import Typography from "@/components/typography";
import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import { METRIC_CARD_CLASS } from "@/lib/card-styles";
import { ChevronDownIcon } from "@/components/vector";
import { useFloatingMenu } from "@/lib/hooks/use-floating-menu";
import {
    CATEGORY_PERIODS,
    formatPercent,
    getCategoryDataForPeriod,
    type CategoryGmvItem,
    type CategoryPeriod,
} from "@/lib/overview/chart-data";

function renderPieSector(props: PieSectorShapeProps) {
    const { isActive, ...sectorProps } = props;

    if (isActive) {
        return (
            <Sector
                {...sectorProps}
                stroke="#fff"
                strokeWidth={3}
                strokeDasharray="4 4"
            />
        );
    }

    return <Sector {...sectorProps} stroke="transparent" />;
}

export default function TopCategoriesChart({ categoryData }: { categoryData?: CategoryGmvItem[] }) {
    const [period, setPeriod] = useState<CategoryPeriod>("This month");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
        isOpen: isDropdownOpen,
        onClose: () => setIsDropdownOpen(false),
        placement: "bottom",
        align: "right",
    });

    const data = useMemo(
        () => categoryData ?? getCategoryDataForPeriod(period),
        [categoryData, period],
    );
    const activeItem: CategoryGmvItem | null =
        activeIndex !== null ? data[activeIndex] ?? null : null;

    return (
        <div className={`flex h-full flex-col p-4 sm:p-6 ${METRIC_CARD_CLASS}`}>
            <div className="flex items-center justify-between gap-3">
                <Typography type="text14" fontWeight={700} className="text-slate-900">
                    Top categories by GMV
                </Typography>

                <div className="relative">
                    <button
                        ref={triggerRef}
                        type="button"
                        data-testid="category-period-trigger"
                        onClick={() => setIsDropdownOpen((open) => !open)}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100"
                    >
                        <Typography type="text14" fontWeight={600} className="text-[#0B0E05]">
                            {period}
                        </Typography>
                        <ChevronDownIcon
                            className={`h-[6px] w-[11px] shrink-0 text-[#0B0E05] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    <FloatingMenuPortal
                        isOpen={isDropdownOpen}
                        isMounted={isMounted}
                        menuRef={menuRef}
                        menuStyle={menuStyle}
                        data-testid="category-period-menu"
                        className="w-44 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-1 shadow-card ring-1 ring-black/5"
                    >
                        {CATEGORY_PERIODS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                data-testid={`category-period-${option.replace(/\s+/g, "-").toLowerCase()}`}
                                onClick={() => {
                                    setPeriod(option);
                                    setIsDropdownOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left ${
                                    option === period ? "bg-slate-50" : "hover:bg-slate-50"
                                }`}
                            >
                                <Typography
                                    type="text12"
                                    fontWeight={option === period ? 700 : 500}
                                    className={option === period ? "text-[#518300]" : "text-slate-600"}
                                >
                                    {option}
                                </Typography>
                                {option === period && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#518300]" />
                                )}
                            </button>
                        ))}
                    </FloatingMenuPortal>
                </div>
            </div>

            <div className="relative mt-4 min-h-[220px] w-full flex-1" data-testid="top-categories-chart">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip content={() => null} cursor={false} />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="58%"
                            outerRadius="78%"
                            paddingAngle={2}
                            shape={renderPieSector}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {activeItem && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] px-4 py-2 text-center shadow-card">
                            <Typography type="text12" fontWeight={600} className="text-slate-800">
                                {activeItem.name}
                            </Typography>
                            <Typography type="text12" fontWeight={500} className="text-slate-500">
                                {formatPercent(activeItem.value)}
                            </Typography>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5" data-testid={`legend-${item.name}`}>
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <Typography type="text12" fontWeight={500} className="text-slate-600">
                            {item.name}
                        </Typography>
                    </div>
                ))}
            </div>
        </div>
    );
}
