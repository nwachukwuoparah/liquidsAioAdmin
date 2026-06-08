"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import Typography from "@/components/typography";
import { METRIC_CARD_CLASS } from "@/lib/card-styles";
import {
    formatGmv,
    formatGmvFull,
    getTrendDataForRange,
    TREND_RANGES,
    type TrendDataPoint,
    type TrendRange,
} from "@/lib/overview/chart-data";

const GMV_COLOR = "#6366F1";
const ORDERS_COLOR = "#10B981";
const ACTIVE_BG = "#B1EC52";

type TooltipPayload = {
    payload: TrendDataPoint;
};

function ChartTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: TooltipPayload[];
}) {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
        <div className="rounded-lg border border-[#0B0E0514] bg-[#FFFFFF] px-3 py-2 shadow-card">
            <p className="text-xs font-bold text-slate-800">Date: {data.date}</p>
            <p className="text-xs font-medium" style={{ color: GMV_COLOR }}>
                GMV: {formatGmvFull(data.gmv)}
            </p>
            <p className="text-xs font-medium" style={{ color: ORDERS_COLOR }}>
                Orders: {data.orders}
            </p>
        </div>
    );
}

type DateTickProps = {
    x?: number | string;
    y?: number | string;
    payload?: { value: string };
    selectedDate: string | null;
    onSelectDate: (date: string) => void;
};

function DateTick({ x = 0, y = 0, payload, selectedDate, onSelectDate }: DateTickProps) {
    const xPos = typeof x === "number" ? x : Number(x) || 0;
    const yPos = typeof y === "number" ? y : Number(y) || 0;
    const label = payload?.value ?? "";
    const isSelected = label === selectedDate;
    const width = Math.max(label.length * 6.5 + 16, 44);

    return (
        <g transform={`translate(${xPos},${yPos})`}>
            <foreignObject
                x={-width / 2}
                y={4}
                width={width}
                height={28}
                className="overflow-visible"
            >
                <button
                    type="button"
                    data-testid={`trend-date-${label.replace(/\s+/g, "-").toLowerCase()}`}
                    onClick={() => onSelectDate(label)}
                    className="mx-auto block cursor-pointer rounded-lg px-2 py-0.5 text-[11px] font-medium leading-tight transition-colors"
                    style={{
                        backgroundColor: isSelected ? ACTIVE_BG : "transparent",
                        color: isSelected ? "#0B0E05" : "#64748B",
                    }}
                >
                    {label}
                </button>
            </foreignObject>
        </g>
    );
}

function ChartLegend() {
    return (
        <div className="mt-2 flex items-center gap-4">
            {[
                { label: "GMV", color: GMV_COLOR },
                { label: "Orders", color: ORDERS_COLOR },
            ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                    <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <Typography type="text12" fontWeight={500} className="text-slate-600">
                        {item.label}
                    </Typography>
                </div>
            ))}
        </div>
    );
}

export default function GmvOrdersTrendChart() {
    const [range, setRange] = useState<TrendRange>("30D");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const data = useMemo(() => getTrendDataForRange(range), [range]);

    useEffect(() => {
        const hasSelection = selectedDate && data.some((point) => point.date === selectedDate);
        if (!hasSelection) {
            setSelectedDate(data[data.length - 1]?.date ?? null);
        }
    }, [data, selectedDate]);

    return (
        <div className={`flex h-full flex-col p-4 sm:p-6 ${METRIC_CARD_CLASS}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Typography type="text14" fontWeight={700} className="text-slate-900">
                    GMV vs Orders trend
                </Typography>

                <div className="flex gap-2">
                    {TREND_RANGES.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            data-testid={`trend-range-${tab}`}
                            onClick={() => setRange(tab)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                                range === tab
                                    ? "text-[#0B0E05]"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                            style={range === tab ? { backgroundColor: ACTIVE_BG } : undefined}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4 min-h-[220px] w-full flex-1" data-testid="gmv-orders-chart">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="0" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={(props) => (
                                <DateTick
                                    {...props}
                                    selectedDate={selectedDate}
                                    onSelectDate={setSelectedDate}
                                />
                            )}
                            height={40}
                            minTickGap={16}
                            interval="preserveStartEnd"
                        />
                        {selectedDate && (
                            <ReferenceLine
                                x={selectedDate}
                                stroke="#CBD5E1"
                                strokeWidth={1}
                            />
                        )}
                        <YAxis
                            yAxisId="gmv"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#64748B" }}
                            tickFormatter={formatGmv}
                            domain={[0, 160000]}
                            ticks={[0, 20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000]}
                            width={48}
                        />
                        <YAxis
                            yAxisId="orders"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#64748B" }}
                            domain={[40, 100]}
                            ticks={[40, 50, 60, 70, 80, 90, 100]}
                            width={32}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Line
                            yAxisId="gmv"
                            type="monotone"
                            dataKey="gmv"
                            stroke={GMV_COLOR}
                            strokeWidth={2}
                            dot={{ r: 4, fill: GMV_COLOR, strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: GMV_COLOR, strokeWidth: 2, stroke: "#fff" }}
                        />
                        <Line
                            yAxisId="orders"
                            type="monotone"
                            dataKey="orders"
                            stroke={ORDERS_COLOR}
                            strokeWidth={2}
                            dot={{ r: 4, fill: ORDERS_COLOR, strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: ORDERS_COLOR, strokeWidth: 2, stroke: "#fff" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <ChartLegend />
        </div>
    );
}
