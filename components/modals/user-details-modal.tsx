// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import Typography from "../typography";
// import { ProfileAvatar } from "../profile-avatar";
// import { ArrowLeftIcon, ComplianceIcon, ModalCloseIcon, NotificationBellIcon, OrdersIcon, TrendIcon } from "../vector";
// import { useModal } from "@/context/modal-provider";
// import { useAdminSuspendAccount, useAdminUserDetails } from "@/lib/admin/hooks/use-admin-users";

// // Placeholder fallback for standard text area component styling usage
// const SUSPEND_MESSAGE_PLACEHOLDER = "Write a short reason for account deactivation";

// interface SuspendFormValues {
//     reason: string;
//     customNote: string;
// }

// interface UserDetailsModalProps {
//     details: {
//         id: string;
//         firstName: string;
//         lastName: string;
//         profilePicture?: string;
//         email?: string;
//         phone?: string;
//         accountStatus?: string;
//         accountHealth?: string;
//         verification?: string;
//         lastActive?: string;
//         joinedDate?: string;
//         location?: string;
//         stats?: {
//             totalOrders: string;
//             totalSpent: string;
//             avgOrderValue: string;
//         };
//         activities?: Array<{
//             id: string;
//             title: string;
//             timestamp: string;
//         }>;
//     };
// }

// // Simulated FormTextareaField locally based on requirements structure
// function FormTextareaField({ label, showRequiredIndicator, className, ...props }: any) {
//     return (
//         <div className="flex flex-col gap-1.5 w-full text-left">
//             <label className="text-[14px] font-medium text-[#0B0E05CC]">
//                 {label} {showRequiredIndicator && <span className="text-[#D92D20]">*</span>}
//             </label>
//             <textarea
//                 {...props}
//                 className={`w-full p-3.5 border border-[#0B0E0514] rounded-xl text-sm text-[#0B0E05] placeholder-[#0B0E05A3] bg-white outline-none focus:border-[#518300] transition-colors resize-none ${className}`}
//             />
//         </div>
//     );
// }

// export default function UserDetailsModal({ details }: UserDetailsModalProps) {
//     const { closeModal } = useModal();
//     const { data: userDetailsData, isLoading } = useAdminUserDetails(details.id);
//     const { mutate: suspendAccount, isPending: isSuspendAccountPending } = useAdminSuspendAccount(details.id, "suspend");

//     // Modal layout view controller for viewing details vs choosing cancellation confirmation panel
//     const [isConfirmingSuspend, setIsConfirmingSuspend] = useState(false);
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [selectedDropdownText, setSelectedDropdownText] = useState("Select reason");
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SuspendFormValues>({
//         defaultValues: {
//             reason: "",
//             customNote: ""
//         }
//     });

//     const showCustomTextarea = selectedDropdownText === "Other (please specify)";

//     const dropdownOptions = [
//         "Fraudulent or suspicious activity",
//         "Repeated dispute or policy violation",
//         "Compliance issue (KYC/KYB failed or expired)",
//         "User request",
//         "Other (please specify)"
//     ];

//     // Close options box container automatically when users click outside space boundaries
//     useEffect(() => {
//         function handleClickOutside(event: MouseEvent) {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setIsDropdownOpen(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     const handleSelectOption = (option: string) => {
//         setSelectedDropdownText(option);
//         setIsDropdownOpen(false);

//         if (option === "Other (please specify)") {
//             setValue("reason", ""); // Explicit rule requirement fulfilled
//         } else {
//             setValue("reason", option);
//         }
//     };

//     const onSubmitSuspend = (data: SuspendFormValues) => {
//         const finalReason = showCustomTextarea ? data.customNote : data.reason;
//         suspendAccount({ reason: finalReason });
//     };

//     const userDetails: any = userDetailsData?.data?.user;
//     const name = `${userDetails?.firstName || details?.firstName || ""} ${userDetails?.lastName || details?.lastName || ""}`.trim() || "---";
//     const email = userDetails?.email || details?.email || "---";
//     const avatar = userDetails?.profilePicture || details?.profilePicture;
//     const phone = userDetails?.kyc?.phoneNumber || details?.phone || "---";
//     const status = userDetails?.accountStatus || details?.accountStatus || "---";
//     const verification = userDetails?.complianceReviewStatus || details?.verification || "---";
//     const health = details?.accountHealth || "99%";
//     const accountType = userDetails?.accountType ? `${userDetails?.accountType?.toUpperCase()} ACCOUNT` : "---";
//     const lastActive = userDetails?.lastActive || details?.lastActive || "---";

//     const joined = userDetails?.createdAt
//         ? new Date(userDetails.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
//         : (details?.joinedDate || "---");

//     const location = userDetails?.businessAddress.location || details?.location || "---";

//     const totalOrders = userDetails?.totalOrders !== undefined ? String(userDetails.totalOrders) : (details?.stats?.totalOrders || "---");
//     const totalSpent = details?.stats?.totalSpent || "---";
//     const avgOrderValue = details?.stats?.avgOrderValue || "---";

//     const activities = details?.activities || [
//         { id: "1", title: "Completed order #224463", timestamp: "2 minutes ago" },
//         { id: "2", title: "Verification approved", timestamp: "Oct 8, 2025 • 5:23PM" },
//         { id: "3", title: "Account created", timestamp: "Jan 15, 2024" },
//     ];

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
//             <div className="w-full h-full sm:h-auto max-w-[640px] sm:max-h-[90vh] bg-white sm:rounded-[16px] flex flex-col overflow-hidden shadow-xl">

//                 <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-4 md:px-6 border-b border-[#0B0E0514] shrink-0">
//                     <div className="flex items-center gap-3">
//                         <button onClick={closeModal} aria-label="Go back"
//                             className="text-[#0B0E05] hover:opacity-70 transition-opacity p-1 -ml-1 sm:hidden">
//                             <ArrowLeftIcon className="w-6 h-6 text-[#0B0E05]" />
//                         </button>

//                         <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
//                             User details
//                         </Typography>
//                     </div>

//                     <button
//                         onClick={closeModal}
//                         aria-label="Close modal"
//                         className="hidden sm:block ml-auto text-[#0B0E05] hover:opacity-70 transition-opacity"
//                     >
//                         <ModalCloseIcon className="w-6 h-6" />
//                     </button>
//                 </div>

//                 <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto text-left pb-8">
//                     <div className="flex flex-row items-center justify-between gap-4 border-b border-[#0B0E0514] pb-5">
//                         <div className="flex gap-4 items-start sm:border-r sm:border-[#0B0E0514] sm:pr-20">
//                             <div className="shrink-0">
//                                 <ProfileAvatar
//                                     size="xl"
//                                     name={name}
//                                     initials={name.charAt(0)}
//                                     imageUrl={avatar}
//                                 />
//                             </div>
//                             <div className="flex flex-col min-w-0">
//                                 <Typography type="text16" fontWeight={700} className="text-[#0B0E05] leading-tight">
//                                     {name}
//                                 </Typography>
//                                 <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] mt-0.5">
//                                     {phone}
//                                 </Typography>
//                                 <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">
//                                     {email}
//                                 </Typography>
//                                 <Typography type="text12" fontWeight={700} className="text-[#518300] tracking-wider mt-1">
//                                     {accountType}
//                                 </Typography>
//                             </div>
//                         </div>

//                         <div className="hidden sm:flex items-center pl-6 h-16 shrink-0">
//                             <button
//                                 onClick={() => setIsConfirmingSuspend(true)}
//                                 disabled={isSuspendAccountPending}
//                                 className="flex items-center gap-2 border border-[#0B0E0514] bg-white text-[#D92D20] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 <svg className="w-4 h-4 text-[#D92D20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
//                                 </svg>
//                                 <span className="text-[#D92D20] text-[14px] font-semibold">
//                                     {isSuspendAccountPending ? "Suspending..." : "Suspend account"}
//                                 </span>
//                             </button>
//                         </div>
//                     </div>

//                     <div className={`border border-[#0B0E0514] rounded-[14px] p-4 bg-[#0B0E0502] flex flex-col sm:grid sm:grid-cols-2 gap-3.5 sm:gap-x-12 sm:gap-y-4 transition-opacity duration-200 ${isLoading ? "animate-pulse opacity-70" : ""}`}>
//                         <div className="flex flex-col gap-3.5 sm:gap-4">
//                             <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-1">
//                                 <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Account status:</Typography>
//                                 <div className="px-2.5 py-0.5 rounded-[6px] bg-[#00A34114] shrink-0">
//                                     <Typography type="text12" fontWeight={500} className="text-[#00A341]">{status}</Typography>
//                                 </div>
//                             </div>

//                             <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-1">
//                                 <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Verification:</Typography>
//                                 <div className="px-2.5 py-0.5 rounded-[6px] bg-[#00A34114] shrink-0">
//                                     <Typography type="text12" fontWeight={500} className="text-[#00A341]">{verification}</Typography>
//                                 </div>
//                             </div>

//                             <div className="flex justify-between items-start sm:flex-col sm:items-start sm:gap-1">
//                                 <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">Joined:</Typography>
//                                 <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">{joined}</Typography>
//                             </div>
//                         </div>

//                         <div className="flex flex-col gap-3.5 sm:gap-4">
//                             <div className="flex justify-between items-start sm:flex-col sm:items-start sm:gap-1">
//                                 <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">Account health:</Typography>
//                                 <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">{health}</Typography>
//                             </div>

//                             <div className="flex justify-between items-start sm:flex-col sm:items-start sm:gap-1">
//                                 <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">Last active:</Typography>
//                                 <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">{lastActive}</Typography>
//                             </div>

//                             <div className="flex justify-between items-start sm:flex-col sm:items-start sm:gap-1">
//                                 <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">Location:</Typography>
//                                 <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left max-w-[70%] sm:max-w-none break-words">{location}</Typography>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="space-y-3">
//                         <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
//                             Buyer stats:
//                         </Typography>
//                         <div className={`flex flex-col sm:grid sm:grid-cols-3 gap-3 transition-opacity duration-200 ${isLoading ? "animate-pulse opacity-70" : ""}`}>
//                             <div className="border border-[#0B0E0514] rounded-xl p-4 bg-white flex flex-col justify-between min-h-[76px]">
//                                 <div className="flex items-center gap-1.5">
//                                     <OrdersIcon className="w-4 h-4 text-[#0B0E05A3]" />
//                                     <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Total orders</Typography>
//                                 </div>
//                                 <Typography type="text16" fontWeight={700} className="text-[#0B0E05] pt-1">
//                                     {totalOrders !== "---" && !totalOrders.includes("orders") ? `${totalOrders} orders` : totalOrders}
//                                 </Typography>
//                             </div>

//                             <div className="border border-[#0B0E0514] rounded-xl p-4 bg-white flex flex-col justify-between min-h-[76px]">
//                                 <div className="flex items-center gap-1.5">
//                                     <ComplianceIcon className="w-4 h-4 text-[#0B0E05A3]" />
//                                     <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Total spent</Typography>
//                                 </div>
//                                 <Typography type="text16" fontWeight={700} className="text-[#0B0E05] pt-1">{totalSpent}</Typography>
//                             </div>

//                             <div className="border border-[#0B0E0514] rounded-xl p-4 bg-white flex flex-col justify-between min-h-[76px]">
//                                 <div className="flex items-center gap-1.5">
//                                     <TrendIcon className="w-4 h-4 text-[#0B0E05A3]" />
//                                     <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Average order value</Typography>
//                                 </div>
//                                 <Typography type="text16" fontWeight={700} className="text-[#0B0E05] pt-1">{avgOrderValue}</Typography>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="space-y-3">
//                         <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">
//                             Recent activity
//                         </Typography>
//                         <div className="space-y-2.5">
//                             {activities.map((activity) => (
//                                 <div key={activity.id} className="flex items-center gap-3.5 bg-[#0B0E0505] rounded-[16px] px-4 py-3.5">
//                                     <div className="shrink-0">
//                                         <NotificationBellIcon className="w-5 h-5 text-[#518300]" />
//                                     </div>
//                                     <div className="flex flex-col min-w-0">
//                                         <Typography type="text14" fontWeight={600} className="text-[#0B0E05] truncate">
//                                             {activity.title}
//                                         </Typography>
//                                         <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3] mt-0.5">
//                                             {activity.timestamp}
//                                         </Typography>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="pt-2 sm:hidden">
//                         <button
//                             onClick={() => setIsConfirmingSuspend(true)}
//                             disabled={isSuspendAccountPending}
//                             className="w-full flex items-center justify-center gap-2 border border-[#0B0E0514] bg-white text-[#D92D20] py-3 rounded-xl text-sm font-semibold hover:bg-red-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             <svg className="w-4 h-4 text-[#D92D20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
//                             </svg>
//                             <span className="text-[#D92D20] text-[15px] font-semibold">
//                                 {isSuspendAccountPending ? "Suspending..." : "Suspend account"}
//                             </span>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

"use client";

import { useState } from "react";
import Typography from "../typography";
import { ProfileAvatar } from "../profile-avatar";
import { ArrowLeftIcon, ArrowsClockwiseIcon, ComplianceIcon, ModalCloseIcon, NotificationBellIcon, OrdersIcon, TrendIcon } from "../vector";
import { useModal } from "@/context/modal-provider";
import { useAdminSuspendAccount, useAdminUserDetails } from "@/lib/admin/hooks/use-admin-users";
import {
    getUserAccountStatusStyles,
    getUserVerificationStatusStyles,
} from "@/lib/users/utilities/user-status-styles";
import SuspendAccountModal from "./suspend-account-modal"; // Import your new component

interface UserDetailsModalProps {
    details: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        email?: string;
        phone?: string;
        accountStatus?: string;
        accountHealth?: string;
        verification?: string;
        lastActive?: string;
        joinedDate?: string;
        location?: string;
        stats?: {
            totalOrders: string;
            totalSpent: string;
            avgOrderValue: string;
        };
        activities?: Array<{
            id: string;
            title: string;
            timestamp: string;
        }>;
    };
}

export default function UserDetailsModal({ details }: UserDetailsModalProps) {
    const { closeModal, showModal } = useModal();
    const { mutate: restoreAccount, isPending: isRestoreAccountPending } = useAdminSuspendAccount(details.id, "restore", {
        onSuccess: () => {
        },
        onError: (error) => {
            console.error(error);
        }
    });
    const { data: userDetailsData, isLoading } = useAdminUserDetails(details.id);

    const userDetails: any = userDetailsData?.data?.user;
    const name = `${userDetails?.firstName || details?.firstName || ""} ${userDetails?.lastName || details?.lastName || ""}`.trim() || "---";
    const email = userDetails?.email || details?.email || "---";
    const avatar = userDetails?.profilePicture || details?.profilePicture;
    const phone = userDetails?.kyc?.phoneNumber || details?.phone || "---";
    const status = userDetails?.accountStatus || details?.accountStatus || "---";
    const verification = userDetails?.complianceReviewStatus || details?.verification || "---";
    const health = details?.accountHealth || "99%";
    const accountType = userDetails?.accountType ? `${userDetails?.accountType?.toUpperCase()} ACCOUNT` : "---";
    const lastActive = userDetails?.lastActive || details?.lastActive || "---";

    const joined = userDetails?.createdAt
        ? new Date(userDetails.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : (details?.joinedDate || "---");

    const location = userDetails?.businessAddress?.location || details?.location || "---";

    const totalOrders = userDetails?.totalOrders !== undefined ? String(userDetails.totalOrders) : (details?.stats?.totalOrders || "---");
    const totalSpent = details?.stats?.totalSpent || "---";
    const avgOrderValue = details?.stats?.avgOrderValue || "---";

    const activities = details?.activities || [
        { id: "1", title: "Completed order #224463", timestamp: "2 minutes ago" },
        { id: "2", title: "Verification approved", timestamp: "Oct 8, 2025 • 5:23PM" },
        { id: "3", title: "Account created", timestamp: "Jan 15, 2024" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            <div className="w-full h-full sm:h-auto max-w-[640px] sm:max-h-[90vh] bg-white sm:rounded-[16px] flex flex-col overflow-hidden shadow-xl relative">

                {/* Header configuration */}
                <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-4 md:px-6 border-b border-[#0B0E0514] shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={closeModal} aria-label="Go back"
                            className="text-[#0B0E05] hover:opacity-70 transition-opacity p-1 -ml-1 sm:hidden">
                            <ArrowLeftIcon className="w-6 h-6 text-[#0B0E05]" />
                        </button>

                        <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
                            User details
                        </Typography>
                    </div>

                    <button
                        onClick={closeModal}
                        aria-label="Close modal"
                        className="hidden sm:block ml-auto text-[#0B0E05] hover:opacity-70 transition-opacity"
                    >
                        <ModalCloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Body Layout Layer */}
                <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto text-left pb-8">
                    <div className="flex flex-row items-center justify-between gap-4 border-b border-[#0B0E0514] pb-5">
                        <div className="flex gap-4 items-start sm:border-r sm:border-[#0B0E0514] sm:pr-20">
                            <div className="shrink-0">
                                <ProfileAvatar
                                    size="xl"
                                    name={name}
                                    initials={name.charAt(0)}
                                    imageUrl={avatar}
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <Typography type="text16" fontWeight={700} className="text-[#0B0E05] leading-tight">
                                    {name}
                                </Typography>
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] mt-0.5">
                                    {phone}
                                </Typography>
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">
                                    {email}
                                </Typography>
                                <Typography type="text12" fontWeight={700} className="text-[#518300] tracking-wider mt-1">
                                    {accountType}
                                </Typography>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center pl-6 h-16 shrink-0">
                            {status !== "suspended" &&
                                <button
                                    onClick={() =>
                                        showModal({
                                            content: <SuspendAccountModal
                                                onClose={closeModal}
                                                details={details}
                                            />
                                        })}
                                    className="flex items-center gap-2 border border-[#0B0E0514] bg-white text-[#D92D20] px-4 py-2.5 rounded-[12px] hover:bg-red-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <svg className="w-4 h-4 text-[#D92D20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <Typography type="text14" fontWeight={400} className="text-[#D92D20]">
                                        Suspend account
                                    </Typography>
                                </button>
                            }

                            {status === "suspended" && (
                                <button
                                    onClick={() => {
                                        restoreAccount({}); // Passing an empty object since reason is optional now
                                    }}
                                    disabled={isRestoreAccountPending}
                                    className="flex items-center gap-2 border border-[#518300] bg-white text-[#518300] px-5 py-2 rounded-[10px] transition-all hover:bg-[#518300]/05 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowsClockwiseIcon
                                        className={`h-5 w-5 shrink-0 text-[#518300] ${isRestoreAccountPending ? 'animate-spin' : ''}`}
                                    />
                                    <span className="text-[#518300]">
                                        {isRestoreAccountPending ? "Restoring..." : "Restore account"}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={`border border-[#0B0E0514] rounded-[14px] p-4 bg-[#0B0E0502] flex flex-col sm:grid sm:grid-cols-2 gap-3.5 sm:gap-x-12 sm:gap-y-4 transition-opacity duration-200 ${isLoading ? "animate-pulse opacity-70" : ""}`}>
                        {/* Status items remain unchanged */}
                        <div className="flex flex-col gap-3.5 sm:gap-4">
                            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-1">
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Account status:</Typography>
                                <span className={`${getUserAccountStatusStyles(status)} rounded-[6px]`}>
                                    {status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-1">
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Verification:</Typography>
                                <span className={`${getUserVerificationStatusStyles(verification)} rounded-[6px]`}>
                                    {verification}
                                </span>
                            </div>
                            <div className="flex justify-between items-start sm:flex-col sm:items-start sm:gap-1">
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">Joined:</Typography>
                                <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">{joined}</Typography>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5 sm:gap-4">
                            <div className="flex justify-between items-start sm:flex-col sm:items-start sm:gap-1">
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">Account health:</Typography>
                                <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">{health}</Typography>
                            </div>
                            <div className="flex justify-between items-start sm:flex-col sm:items-start sm:gap-1">
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">Last active:</Typography>
                                <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left">{lastActive}</Typography>
                            </div>
                            <div className="flex justify-between items-start sm:flex-col sm:items-start sm:gap-1">
                                <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3] shrink-0">Location:</Typography>
                                <Typography type="text14" fontWeight={600} className="text-[#0B0E05] text-right sm:text-left max-w-[70%] sm:max-w-none break-words">{location}</Typography>
                            </div>
                        </div>
                    </div>

                    {/* Stats & Activities remain unchanged */}
                    <div className="space-y-3">
                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">Buyer stats:</Typography>
                        <div className={`flex flex-col sm:grid sm:grid-cols-3 gap-3 transition-opacity duration-200 ${isLoading ? "animate-pulse opacity-70" : ""}`}>
                            <div className="border border-[#0B0E0514] rounded-xl p-4 bg-white flex flex-col justify-between min-h-[76px]">
                                <div className="flex items-center gap-1.5">
                                    <OrdersIcon className="w-4 h-4 text-[#0B0E05A3]" />
                                    <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Total orders</Typography>
                                </div>
                                <Typography type="text16" fontWeight={700} className="text-[#0B0E05] pt-1">
                                    {totalOrders !== "---" && !totalOrders.includes("orders") ? `${totalOrders} orders` : totalOrders}
                                </Typography>
                            </div>

                            <div className="border border-[#0B0E0514] rounded-xl p-4 bg-white flex flex-col justify-between min-h-[76px]">
                                <div className="flex items-center gap-1.5">
                                    <ComplianceIcon className="w-4 h-4 text-[#0B0E05A3]" />
                                    <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Total spent</Typography>
                                </div>
                                <Typography type="text16" fontWeight={700} className="text-[#0B0E05] pt-1">{totalSpent}</Typography>
                            </div>

                            <div className="border border-[#0B0E0514] rounded-xl p-4 bg-white flex flex-col justify-between min-h-[76px]">
                                <div className="flex items-center gap-1.5">
                                    <TrendIcon className="w-4 h-4 text-[#0B0E05A3]" />
                                    <Typography type="text14" fontWeight={400} className="text-[#0B0E05A3]">Average order value</Typography>
                                </div>
                                <Typography type="text16" fontWeight={700} className="text-[#0B0E05] pt-1">{avgOrderValue}</Typography>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Typography type="text16" fontWeight={700} className="text-[#0B0E05]">Recent activity</Typography>
                        <div className="space-y-2.5">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-3.5 bg-[#0B0E0505] rounded-[16px] px-4 py-3.5">
                                    <div className="shrink-0"><NotificationBellIcon className="w-5 h-5 text-[#518300]" /></div>
                                    <div className="flex flex-col min-w-0">
                                        <Typography type="text14" fontWeight={600} className="text-[#0B0E05] truncate">{activity.title}</Typography>
                                        <Typography type="text12" fontWeight={400} className="text-[#0B0E05A3] mt-0.5">{activity.timestamp}</Typography>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 sm:hidden">
                        <button
                            onClick={() =>
                                showModal({
                                    content: <SuspendAccountModal
                                        onClose={closeModal}
                                        details={details}
                                    />
                                })
                            }
                            className="w-full flex items-center justify-center gap-2 border border-[#0B0E0514] bg-white text-[#D92D20] py-3 rounded-xl text-sm font-semibold hover:bg-red-50/50 transition-colors"
                        >
                            <svg className="w-4 h-4 text-[#D92D20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span className="text-[#D92D20] text-[15px] font-semibold">
                                Suspend account
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}