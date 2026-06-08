"use client";

import React from 'react';
import Typography from '@/components/typography';
import {
    ArrowsClockwiseIcon,
    HourglassIcon,
    PencilSimpleLineIcon,
    RejectXIcon,
    TrashIcon,
    UserCheckIcon,
} from '@/components/vector';
import { CARD_BG_CLASS, LIST_CARD_CLASS, METRIC_CARD_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS } from '@/lib/card-styles';
import { getMemberStatusStyles } from '@/lib/team-member-status';

interface TeamMember {
    sn: string;
    name: string;
    email: string;
    role: string;
    lastActive: string;
    status: 'Active' | 'Pending';
    initials: string;
    avatarBg?: string;
};

export const TeamsAndPermissions: React.FC = () => {

    const teamMembers: TeamMember[] = [
        {
            sn: "1.",
            name: "Samuel Nathaniel",
            email: "Samuel@liquidsaio.com",
            role: "Super admin",
            lastActive: "2 mins ago",
            status: "Active",
            initials: "SN"
        },
        {
            sn: "2.",
            name: "Jenny Wilson",
            email: "Jenny@liquidsaio.com",
            role: "Compliance reviewer",
            lastActive: "1 mins ago",
            status: "Active",
            initials: "JW",
            avatarBg: "bg-[#518300] text-white"
        },
        {
            sn: "3.",
            name: "Ralph Edwards",
            email: "ralph@liquidsaio.com",
            role: "Inventory moderator",
            lastActive: "yesterday",
            status: "Active",
            initials: "RE"
        },
        {
            sn: "4.",
            name: "Sarah Chen",
            email: "sarah@liquidsaio.com",
            role: "Compliance reviewer",
            lastActive: "2 days ago",
            status: "Pending",
            initials: "SC"
        },
        {
            sn: "5.",
            name: "Theresa Webb",
            email: "theresa@liquidsaio.com",
            role: "Viewer",
            lastActive: "Oct 9, 2025",
            status: "Pending",
            initials: "TW"
        }
    ];

    return (
        <div className={PANEL_CARD_SHELL_CLASS}>
            <div className={`w-full p-4 md:p-6 ${PANEL_CARD_CLASS}`}>
            {/* Top Main Header Control Row */}
            <div className="flex items-start justify-between border-b border-[#0B0E0514] pb-5">
                <div className='flex flex-col'>
                    <Typography type="text20" fontWeight={700} className="text-[#101828]">
                        Teams & permission
                    </Typography>
                    <Typography type="text14" className="text-[#0B0E05] mt-1">
                        Manage who can access the admin dashboard ans what each member can do.
                    </Typography>
                </div>

                {/* Desktop Add Member Button: Visible ONLY on desktop (md and up) */}
                <button className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-[#0B0E0529] bg-[#FFFFFF] px-4 py-2.5 shadow-card transition-colors hover:bg-[#0B0E050A] md:flex">
                    <svg className="w-4 h-4 text-[#344054]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <Typography type="text14" fontWeight={600} className="text-[#344054]">
                        Add team member
                    </Typography>
                </button>
            </div>

            {/* Metrics Row Cards Section */}
            <div className="flex flex-col sm:flex-row gap-4 my-6">
                {/* Active Members Metric */}
                <div className={`w-full p-4 transition-colors hover:bg-[#0B0E050A] sm:max-w-[260px] ${METRIC_CARD_CLASS}`}>
                    <div className='flex flex-row items-center justify-between'>
                        <Typography type="text24" fontWeight={700} className="text-[#101828] leading-none">
                            3
                        </Typography>
                        <div className="shrink-0 rounded-lg bg-[#00A34114] p-2 text-[#00A341]">
                            <UserCheckIcon className="h-5 w-5" />
                        </div>
                    </div>

                    <div className='flex flex-col'>
                        <Typography type="text14" fontWeight={500} className="text-[#344054] mt-3 block">
                            Active members
                        </Typography>
                        <Typography type="text12" className="mt-0.5 block leading-normal text-[#0B0E05A3]">
                            (Admins with full or partial access)
                        </Typography>
                    </div>
                </div>

                {/* Pending Invites Metric */}
                <div className={`w-full p-4 transition-colors hover:bg-[#0B0E050A] sm:max-w-[260px] ${METRIC_CARD_CLASS}`}>
                    <div className='flex flex-row items-center justify-between'>
                        <Typography type="text24" fontWeight={700} className="text-[#101828] leading-none">
                            2
                        </Typography>
                        <div className="shrink-0 rounded-lg bg-[#DC680314] p-2 text-[#DC6803]">
                            <HourglassIcon className="h-[17px] w-3" />
                        </div>
                    </div>

                    <div className='flex flex-col'>
                        <Typography type="text14" fontWeight={500} className="text-[#344054] mt-3 block">
                            Pending invites
                        </Typography>
                        <Typography type="text12" className="mt-0.5 block leading-normal text-[#0B0E05A3]">
                            Invitations sent but not yet accepted.
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Mobile Sub-Header Toolbar: Visible ONLY on mobile (hidden on md and up) */}
            <div className="flex md:hidden justify-between items-center mt-8 mb-4">
                <Typography type="text16" fontWeight={700} className="text-black">
                    Your team members
                </Typography>
                <button className="flex items-center gap-1.5 rounded-xl border border-[#0B0E0529] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#344054] shadow-card transition-colors hover:bg-[#0B0E050A]">
                    <span className="text-sm text-gray-500 font-medium">+</span> Add member
                </button>
            </div>

            {/* --- DESKTOP TABLE INTERFACE --- */}
            <div className={`hidden w-full md:block ${PANEL_CARD_SHELL_CLASS}`}>
                <div className={`${PANEL_CARD_CLASS} rounded-xl`}>
                <table className="w-full table-auto border-collapse text-left">
                    <thead>
                        <tr className="border-b border-[#0B0E0529] bg-[#0B0E050A]">
                            <th className="w-14 bg-[#0B0E050A] px-4 py-3">
                                <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">S/N</Typography>
                            </th>
                            <th className="bg-[#0B0E050A] px-4 py-3">
                                <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Name</Typography>
                            </th>
                            <th className="bg-[#0B0E050A] px-4 py-3">
                                <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Email</Typography>
                            </th>
                            <th className="bg-[#0B0E050A] px-4 py-3">
                                <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Role</Typography>
                            </th>
                            <th className="bg-[#0B0E050A] px-4 py-3">
                                <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Last active</Typography>
                            </th>
                            <th className="bg-[#0B0E050A] px-4 py-3">
                                <Typography type="text12" fontWeight={700} className="uppercase tracking-wider text-[#0B0E05A3]">Status</Typography>
                            </th>
                            <th className="w-24 bg-[#0B0E050A] px-4 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0B0E0529]">
                        {teamMembers.map((member) => (
                            <tr key={member.sn} className="transition-colors hover:bg-[#0B0E050A]">
                                <td className="py-3.5 px-4 vertical-middle">
                                    <Typography type="text14" fontWeight={600} className="text-[#101828]">{member.sn}</Typography>
                                </td>
                                <td className="py-3.5 px-4 vertical-middle">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-card ${member.avatarBg || 'bg-[#F2F4F7] text-[#344054]'}`}>
                                            {member.initials}
                                        </div>
                                        <Typography type="text14" fontWeight={500} className="text-[#101828]">{member.name}</Typography>
                                    </div>
                                </td>
                                <td className="py-3.5 px-4 vertical-middle">
                                    <Typography type="text14" className="text-[#475467]">{member.email}</Typography>
                                </td>
                                <td className="py-3.5 px-4 vertical-middle">
                                    <Typography type="text14" className="text-[#475467]">{member.role}</Typography>
                                </td>
                                <td className="py-3.5 px-4 vertical-middle">
                                    <Typography type="text14" className="text-[#475467]">{member.lastActive}</Typography>
                                </td>
                                <td className="py-3.5 px-4 vertical-middle">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getMemberStatusStyles(member.status)}`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-right vertical-middle whitespace-nowrap">
                                    {member.status === 'Active' ? (
                                        <div className="flex justify-end items-center gap-3.5 text-[#0B0E05]">
                                            <button type="button" aria-label="Edit permission" className="cursor-pointer transition-colors hover:text-[#101828]">
                                                <PencilSimpleLineIcon className="h-4 w-4" />
                                            </button>
                                            <button type="button" aria-label="Revoke access" className="cursor-pointer transition-colors hover:text-[#D92D20]">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end items-center gap-3.5 text-[#0B0E05]">
                                            <button type="button" aria-label="Resend invite" className="cursor-pointer transition-colors hover:text-[#101828]">
                                                <ArrowsClockwiseIcon className="h-4 w-4" />
                                            </button>
                                            <button type="button" aria-label="Cancel invite" className="cursor-pointer text-[#D92D20] transition-colors hover:text-red-800">
                                                <RejectXIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex w-full justify-center border-t border-[#0B0E0529] bg-[#FFFFFF] py-3.5">
                    <button className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#0B0E0529] bg-[#FFFFFF] px-3 py-1.5 shadow-card transition-colors hover:bg-[#0B0E050A]">
                        <Typography type="text14" fontWeight={600} className="text-[#344054]">See more</Typography>
                        <svg className="w-4 h-4 text-[#475467]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>
                </div>
            </div>

            {/* --- MOBILE STACKED VIEW INTERFACE --- */}
            <div className="block md:hidden space-y-4">
                {teamMembers.map((member) => (
                    <div key={member.sn} className={`flex w-full flex-col p-4 transition-colors hover:bg-[#0B0E050A] ${LIST_CARD_CLASS}`}>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-card ${member.avatarBg || 'bg-[#F2F4F7] text-[#344054]'}`}>
                                    {member.initials}
                                </div>
                                <Typography type="text14" fontWeight={600} className="text-[#101828]">
                                    {member.name}
                                </Typography>
                            </div>

                            <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${getMemberStatusStyles(member.status)}`}>
                                {member.status}
                            </span>
                        </div>

                        <div className="mb-3.5 grid grid-cols-2 gap-y-2 border-b border-[#0B0E0529] pb-3.5 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="text-[#667085]">Active:</span>
                                <span className="text-[#344054] font-medium">{member.lastActive}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                                <span className="text-[#667085]">Role:</span>
                                <span className="text-[#344054] font-medium text-right">{member.role}</span>
                            </div>
                            <div className="col-span-2 flex items-center gap-1">
                                <span className="text-[#667085]">Email:</span>
                                <span className="text-[#344054] font-medium break-all">{member.email}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            {member.status === 'Active' ? (
                                <>
                                    <button type="button" className="flex cursor-pointer items-center gap-1.5 font-semibold text-[#344054] transition-colors hover:text-[#101828]">
                                        <PencilSimpleLineIcon className="h-4 w-4" />
                                        Edit permission
                                    </button>
                                    <button type="button" className="flex cursor-pointer items-center gap-1.5 font-semibold text-[#D92D20] transition-colors hover:text-red-800">
                                        <TrashIcon className="h-4 w-4" />
                                        Revoke
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" className="flex cursor-pointer items-center gap-1.5 font-semibold text-[#344054] transition-colors hover:text-[#101828]">
                                        <ArrowsClockwiseIcon className="h-4 w-4" />
                                        Resend
                                    </button>
                                    <button type="button" className="flex cursor-pointer items-center gap-1.5 font-semibold text-[#D92D20] transition-colors hover:text-red-800">
                                        <RejectXIcon className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                ))}
            </div>

            </div>
        </div>
    );
};