"use client";

import React, { useState } from "react";
import Typography from "../typography";
import type { AdminRfqApiRecord } from "@/lib/rfq/types/admin-rfqs-api.types";
import { ProfileAvatar } from "../profile-avatar";
import { getCategoryLabel } from "@/app/(admin)/rfqs/page";
import { ApproveCheckIcon, ArrowLeftIcon, ModalCloseIcon } from "../vector";
import LightbulbIcon from "../vector/light-bulb-icon";
import { useModal } from "@/context/modal-provider";
import { useAdminRfqResolve } from "@/lib/admin/hooks/use-admin-rfqs";
import DynamicFilters from "../dynamic-filters";
import {
    formatAdminRfqBudget,
    formatAdminRfqDate,
} from "@/lib/rfq/utilities/map-admin-rfq-api-record";

interface RequestDetailsProps {
    details: AdminRfqApiRecord;
}

export default function RequestDetails({ details }: RequestDetailsProps) {
    const [assignedTo, setAssignedTo] = useState<string>("");
    const { closeModal } = useModal();
    const resolveRfq = useAdminRfqResolve();
    const isResolved = details.status === "resolved";

    const handleMarkAsResolved = () => {
        resolveRfq.mutate(details.id, {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
            <div className="flex h-full w-full flex-col overflow-y-auto bg-white md:h-auto md:w-[55%] md:rounded-[13px]">
                <div className="flex items-center justify-between border-b border-[#0B0E0514] px-5 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="mr-4 text-slate-800 md:hidden"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon className="h-6 w-6 text-[#0B0E05]" />
                        </button>

                        <Typography type="text20" fontWeight={700} className="flex-1 text-slate-900">
                            Request details
                        </Typography>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close dialog"
                        className="hidden p-1 md:block"
                    >
                        <ModalCloseIcon className="h-5 w-5 cursor-pointer text-[#0B0E05]" />
                    </button>
                </div>

                <div className="flex-1 space-y-6 p-5 md:p-6">
                    <div className="flex flex-col rounded-xl border border-[#0B0E0514] bg-[#DC68030A] p-2">
                        <div className="flex items-center gap-2 space-y-0.5">
                            <LightbulbIcon className="h-5 w-5 text-[#DC6803]" />
                            <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                Quick Tip
                            </Typography>
                        </div>
                        <Typography type="text14" fontWeight={400} className="leading-relaxed text-[#000000]">
                            You can mark requests as resolve if the request has been fulfilled or buyer
                            has been attended to.
                        </Typography>
                    </div>

                    <div className="flex flex-col justify-between gap-4 border-y border-[#0B0E0514] pb-5 pt-5 md:flex-row md:items-center">
                        <div className="flex flex-1 gap-4 lg:border-r">
                            <ProfileAvatar
                                size="xxl"
                                name={details.user.firstName}
                                initials={details.user.firstName.charAt(0)}
                                imageUrl={details.user.profilePicture}
                            />
                            <div className="flex flex-col space-y-0.5">
                                <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
                                    {details.user.firstName} {details.user.lastName}
                                </Typography>
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05]">
                                    +1 (555) 123-4567
                                </Typography>
                                <Typography type="text16" fontWeight={400} className="text-[#0B0E05]">
                                    johnpeters@email.com
                                </Typography>
                                <Typography type="text12" fontWeight={700} className="text-[#518300]">
                                    BUYER ACCOUNT
                                </Typography>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
                            <Typography type="text14" fontWeight={700} className="text-slate-900">
                                Assigned to:
                            </Typography>
                            <div className="relative inline-block w-full md:w-auto">
                                <DynamicFilters
                                    filters={[
                                        {
                                            id: assignedTo,
                                            label: "Select Assignee",
                                            isSearchable: true,
                                            defaultValue: "Sarah Chen",
                                            options: [
                                                "Select Assignee",
                                                "Alex Rivera",
                                                "John Jane",
                                                "Jane Doe",
                                            ],
                                            icon: <></> as React.ReactNode,
                                        },
                                    ]}
                                    selectedValues={{ [assignedTo]: assignedTo }}
                                    onFilterChange={(_filterId: string, value: string) => {
                                        if (value === "Select Assignee") {
                                            setAssignedTo("");
                                            return;
                                        }
                                        setAssignedTo(value);
                                    }}
                                    className="relative z-30 flex flex-wrap items-center gap-2.5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3.5 pt-2">
                        <div className="flex items-center justify-between">
                            <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">
                                Category:
                            </Typography>
                            <Typography type="text14" fontWeight={600} className="text-[#0B0E05]">
                                {getCategoryLabel(details.category ?? "---")}
                            </Typography>
                        </div>

                        <div className="flex items-center justify-between">
                            <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">
                                Budget:
                            </Typography>
                            <Typography type="text14" fontWeight={600} className="font-mono text-[#0B0E05]">
                                {formatAdminRfqBudget(details.minPrice, details.maxPrice)}
                            </Typography>
                        </div>

                        <div className="flex items-center justify-between">
                            <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">
                                Date of request:
                            </Typography>
                            <Typography type="text14" fontWeight={600} className="text-[#0B0E05]">
                                {formatAdminRfqDate(details.createdAt)}
                            </Typography>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2 border-t border-[#0B0E0514] pt-5">
                        <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">
                            Description or requirements:
                        </Typography>
                        <Typography type="text14" fontWeight={400} className="leading-relaxed text-slate-800">
                            {details.description}
                        </Typography>
                    </div>
                </div>

                {!isResolved ? (
                    <div className="border-t border-slate-100 bg-white p-5 md:flex md:justify-end">
                        <button
                            type="button"
                            disabled={resolveRfq.isPending}
                            onClick={handleMarkAsResolved}
                            data-testid="rfq-details-mark-resolved"
                            className="flex w-full items-center justify-center gap-2 rounded-[13px] border border-[#0B0E0514] px-3 py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                        >
                            <ApproveCheckIcon className="h-3 w-4 text-[#0B0E05]" />
                            <Typography type="text16" fontWeight={500} className="text-[#0B0E05]">
                                {resolveRfq.isPending ? "Please wait…" : "Mark as resolved"}
                            </Typography>
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
