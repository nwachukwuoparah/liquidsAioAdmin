"use client";

import Typography from '@/components/typography';
import { ApproveCheckIcon, PencilSimpleLineIcon } from '@/components/vector';
import { CARD_BG_CLASS } from '@/lib/card-styles';
import React, { useState } from 'react';

export const GeneralSettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState("support@liquidsaio.com");
    const [phone, setPhone] = useState("+1 (555) 555 55555");

    return (
        // Spans full width and height of the wrapper container, centering the child block
        <div className={`flex h-[100vh] w-full justify-center rounded-[12px] shadow-card md:p-12 ${CARD_BG_CLASS}`}>
            {/* Main structural content card matching your design dimensions */}
            <div className="w-full p-4 lg:w-[45%] bg-[#FFFFFF]">

                {/* Header Information Section */}
                <div className="flex  justify-between items-start mb-6 gap-4">
                    <div>
                        <Typography type="text20" fontWeight={700} className="text-slate-900">
                            General settings
                        </Typography>
                        <Typography type="text14" className=" mt-1 leading-normal">
                            Basic platform contact details used for system alerts and user support
                        </Typography>
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 transition-all ${
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
                        <Typography
                            type="text12"
                            fontWeight={700}
                            className={isEditing ? "!text-[#0B0E05]" : "text-[#0B0E05]"}
                        >
                            {isEditing ? "Save" : "Edit"}
                        </Typography>
                    </button>
                </div>

                {/* Fine Section Divider */}
                <div className="border-b border-[#0B0E0514] mb-6" />

                {/* Form Input Workspaces */}
                <div className="space-y-6">
                    {/* Contact Email Field Group */}
                    <div className="flex flex-col space-y-2">
                        <Typography type="text14" fontWeight={700} className="tracking-wider text-[#0B0E05] block">
                            Contact email
                        </Typography>
                        <Typography type="text12" className="text-[#00000FA3] leading-normal block">
                            This email will receive important system notifications and user support messages. This is different from your personal account email.
                        </Typography>
                        <div className={`w-full rounded-xl transition-all ${isEditing ? 'bg-[#FFFFFF] border border-[#0B0E0514]' : 'bg-slate-50/70 border border-transparent'}`}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!isEditing}
                                className="w-full bg-transparent px-4 py-3 text-[13px] outline-none text-slate-800 font-medium disabled:"
                            />
                        </div>
                    </div>

                    {/* Support Phone Field Group */}
                    <div className="flex flex-col space-y-2">
                        <Typography type="text12" fontWeight={700} className="tracking-wider text-[#0B0E05] block">
                            Support phone
                        </Typography>
                        <Typography type="text12" className="text-[#00000FA3] leading-normal block">
                            Displayed on help pages and used for urgent communications from verified partners.
                        </Typography>
                        <div className={`w-full rounded-xl transition-all ${isEditing ? 'bg-[#FFFFFF] border border-[#0B0E0514]' : 'bg-slate-50/70 border border-transparent'}`}>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={!isEditing}
                                className="w-full bg-transparent px-4 py-3 text-[13px] outline-none text-slate-800 font-medium disabled:"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};