"use client";

import React, { useState } from 'react';
import { ProfileImageUpload } from '@/components/profile-image-upload';
import Typography from '@/components/typography';
import { ApproveCheckIcon, CaretRightIcon, PencilSimpleLineIcon } from '@/components/vector';
import { CARD_BG_CLASS, LIST_CARD_CLASS, SECTION_CARD_CLASS } from '@/lib/card-styles';

const fieldWrapperClass = (isEditing: boolean) =>
    `w-full rounded-xl transition-all ${
        isEditing ? `border border-[#0B0E0514] ${CARD_BG_CLASS}` : "border border-transparent bg-slate-50/70"
    }`;

const fieldInputClass =
    "w-full bg-transparent px-4 py-3 text-[13px] font-medium text-slate-800 outline-none disabled:cursor-default";

export const ProfileSettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState("Samuel Nathaniel");
    const [phone, setPhone] = useState("212-456-7890");
    const [timezone, setTimezone] = useState("gmt-05");

    return (
        <div className={`min-h-screen w-full font-sans antialiased lg:min-h-0 lg:rounded-[12px] lg:shadow-card ${CARD_BG_CLASS}`}>
            <div className="mx-auto w-full max-w-[600px] space-y-4 p-4 md:p-8">
                <div className="flex justify-between items-center">
                    <Typography type="text20" fontWeight={700} className="text-[#101828] md:text-xl">
                        Profile settings
                    </Typography>

                    <button
                        type="button"
                        aria-label={isEditing ? "Save profile settings" : "Edit profile settings"}
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 transition-all ${
                            isEditing
                                ? "border border-transparent bg-[#B1EC52] shadow-card"
                                : "border border-[#0B0E0514] bg-[#FFFFFF] hover:bg-[#0B0E050A]"
                        }`}
                    >
                        {isEditing ? (
                            <ApproveCheckIcon className="h-3 w-4 shrink-0 text-[#0B0E05]" />
                        ) : (
                            <PencilSimpleLineIcon className="h-4 w-4 shrink-0 text-[#0B0E05]" />
                        )}
                        <Typography type="text12" fontWeight={700} className="text-[#0B0E05]">
                            {isEditing ? "Save" : "Edit"}
                        </Typography>
                    </button>
                </div>

                <div className={`w-full space-y-6 p-4 md:p-6 ${SECTION_CARD_CLASS}`}>

                    <ProfileImageUpload name={fullName} />

                    <div className="flex flex-col space-y-2">
                        <Typography type="text14" fontWeight={700} className="block text-[#0B0E05]">
                            Full name
                        </Typography>
                        <div className={fieldWrapperClass(isEditing)}>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={!isEditing}
                                className={fieldInputClass}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Typography type="text14" fontWeight={700} className="block text-[#0B0E05]">
                            Phone number
                        </Typography>
                        <div className={`flex w-full overflow-hidden ${fieldWrapperClass(isEditing)}`}>
                            <div
                                className={`flex shrink-0 items-center gap-2 bg-transparent px-3.5 py-3 ${
                                    isEditing ? "border-r border-[#0B0E0514]" : "border-r border-transparent"
                                }`}
                            >
                                <div className="relative flex h-3.5 w-5 flex-col justify-between overflow-hidden rounded-xs bg-[#175CD3]">
                                    <div className="h-2 w-2.5 bg-[#D92D20]" />
                                    <div className="absolute top-2 h-[2px] w-full bg-[#FFFFFF]" />
                                </div>
                                <span className="text-[13px] font-medium text-[#475467]">+1</span>
                            </div>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={!isEditing}
                                className={fieldInputClass}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Typography type="text14" fontWeight={700} className="block text-[#0B0E05]">
                            Timezone
                        </Typography>
                        <div className={`relative ${fieldWrapperClass(isEditing)}`}>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                disabled={!isEditing}
                                className={`${fieldInputClass} appearance-none pr-10 ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                            >
                                <option value="gmt-05">(GMT -05:00) Eastern Time (US & Canada)</option>
                            </select>
                            <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
                                <CaretRightIcon className="h-4 w-4 rotate-90 text-[#0B0E05]" />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="space-y-4">
                    <Typography type="text16" fontWeight={700} className="text-[#101828] tracking-tight">
                        Account settings
                    </Typography>

                    {/* Change Email Component card */}
                    <div className={`flex w-full items-center justify-between p-4 ${LIST_CARD_CLASS}`}>
                        <div className="space-y-0.5">
                            <div className='flex flex-col'>
                                <Typography type="text14" fontWeight={700} className="text-[#101828]">
                                    Change email
                                </Typography>
                                <Typography type="text14" className="text-[#344054] block">
                                    [samuel@liquidsAIO.com]
                                </Typography>
                            </div>
                            <Typography type="text12" className="text-[#667085] block pt-0.5">
                                Update the email linked to your your admin account.
                            </Typography>
                        </div>
                        {/* Colored Box replacing Edit Icon inside box */}
                        <button className="ml-4 flex shrink-0 cursor-pointer items-center gap-2 border-l border-[#0B0E0514] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#344054] transition-colors hover:bg-gray-50">
                            <PencilSimpleLineIcon className="h-3.5 w-3.5 shrink-0 text-[#475467]" />
                            Edit
                        </button>
                    </div>

                    {/* Change Password Component card */}
                    <div className={`flex w-full items-center justify-between p-4 ${LIST_CARD_CLASS}`}>
                        <div className="space-y-0.5">
                            <div className='flex flex-col'>
                                <Typography type="text14" fontWeight={700} className="text-[#101828]">
                                    Change password
                                </Typography>
                                <Typography type="text14" className="text-[#344054] tracking-widest block font-bold">
                                    [••••••••••••••••••••]
                                </Typography>
                            </div>
                            <Typography type="text12" className="text-[#667085] block pt-0.5">
                                Choose a strong password to keep your account secure.
                            </Typography>
                        </div>
                        {/* Colored Box replacing Edit Icon inside box */}
                        <button className="ml-4 flex shrink-0 cursor-pointer items-center gap-2 border-l border-[#0B0E0514] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#344054] transition-colors hover:bg-gray-50">
                            <PencilSimpleLineIcon className="h-3.5 w-3.5 shrink-0 text-[#475467]" />
                            Edit
                        </button>
                    </div>

                    {/* Two-factor Authentication Component card */}
                    <button className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50/50 ${LIST_CARD_CLASS} cursor-pointer group`}>
                        <div className="flex flex-col space-y-0.5">
                            <Typography type="text14" fontWeight={700} className="text-[#101828]">
                                Two-factor authentication
                            </Typography>
                            <Typography type="text12" className="text-[#667085] block">
                                Add an extra layer of protection to your admin account.
                            </Typography>
                        </div>
                        <CaretRightIcon className="ml-4 h-4 w-4 shrink-0 text-[#667085] transition-colors group-hover:text-[#101828]" />
                    </button>
                </div>
            </div>
        </div>
    );
};