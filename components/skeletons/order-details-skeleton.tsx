import React from "react";
import { Skeleton } from "@/components/skeletons/admin-data-skeletons";

export function OrderDetailsSkeleton() {
    return (
        <div data-testid="order-details-skeleton" className="space-y-6">
            {/* 1. Parties involved skeleton */}
            <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-72 mb-3" />
                <div className="rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-36" />
                                <Skeleton className="h-2.5 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-36" />
                                <Skeleton className="h-2.5 w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Order information skeleton */}
            <div>
                <Skeleton className="h-5 w-40 mb-3" />
                <div className="rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] p-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-32 rounded-lg" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="h-px w-full bg-[#0B0E0514]" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-44" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-14" />
                    </div>
                    <div className="h-px w-full bg-[#0B0E0514]" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="h-px w-full bg-[#0B0E0514]" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-6 w-20 rounded-lg" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                </div>
            </div>

            {/* 3. Shipping information skeleton */}
            <div>
                <Skeleton className="h-5 w-44 mb-3" />
                <div className="rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-14" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Shipment timeline skeleton */}
            <div>
                <Skeleton className="h-5 w-40 mb-3" />
                <div className="space-y-4 pl-1">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                        <div className="space-y-1 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                        <div className="space-y-1 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-64" />
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>
            </div>

            {/* 5. Action buttons skeleton */}
            <div className="pt-2 flex items-center gap-3">
                <Skeleton className="h-11 flex-1 rounded-xl" />
                <Skeleton className="h-11 flex-1 rounded-xl" />
            </div>
        </div>
    );
}
