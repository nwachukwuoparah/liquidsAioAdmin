// "use client";

// import DynamicFilters, { type FilterConfig } from "@/components/dynamic-filters";
// import { ProfileAvatar } from "@/components/profile-avatar";
// import SearchInput from "@/components/search-input";
// import Typography from "@/components/typography";
// import UserActionMenu from "@/components/user-action-menu";
// import {
//     AllUsersIcon,
//     CalendarDotsIcon,
//     FirstAidIcon,
//     MapPinIcon,
//     ShieldIcon,
//     SlidersHorizontalIcon,
//     UserCheckIcon,
//     UserPlusIcon,
//     UsersGroupIcon,
//     WarningIcon,
// } from "@/components/vector";
// import { useAdminUsers, useAdminUserStats } from "@/lib/admin/hooks";
// import { CARD_BG_CLASS, PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS, STAT_CARD_CLASS } from "@/lib/card-styles";
// import { formatCount } from "@/lib/format-count";
// import React, { useCallback, useEffect, useMemo, useState } from "react";

// const REPORTED_COUNT = 32;


// const userFilters = [
//     {
//         id: "verification",
//         label: "Verification status",
//         icon: <ShieldIcon className="h-[16px] w-[15px] text-[#343330]" />,
//     },
//     {
//         id: "status",
//         label: "Account status",
//         icon: <AllUsersIcon className="h-5 w-5 text-[#343330]" />,
//     },
//     {
//         id: "health",
//         label: "Account health",
//         icon: <FirstAidIcon className="h-5 w-5 text-[#343330]" />,
//     },
//     {
//         id: "joinedDate",
//         label: "Joined date",
//         icon: <CalendarDotsIcon className="h-5 w-5 text-[#343330]" />,
//     },
//     {
//         id: "location",
//         label: "Location",
//         icon: <MapPinIcon className="h-5 w-5 text-[#343330]" />,
//     },
// ] as const;


// export default function AllUsersBody() {
//     const [filterParams, setFilterParams] = useState<Record<string, string>>();
//     // Navigation segment tab states
//     const [activeSegmentTab, setActiveSegmentTab] = useState<"buyer" | "seller" | "reported">("buyer");
//     const [searchQuery, setSearchQuery] = useState("");
//     const [actionMenuUserSn, setActionMenuUserSn] = useState<number | null>(null);

//     // Operational states for filters
//     const [filterAccountStatus, setFilterAccountStatus] = useState<string>("");
//     const [filterComplianceStatus, setFilterComplianceStatus] = useState<string>("");
//     // const [filterAccountHealth, setFilterAccountHealth] = useState<string>("");
//     const [filterJoinedDate, setFilterJoinedDate] = useState<string>("All time");
//     const [filterLocation, setFilterLocation] = useState<string>("All locations");

//     const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useAdminUsers({
//         accountType: activeSegmentTab as "buyer" | "seller" | "reported",
//         complianceStatus: filterComplianceStatus,
//         //  accountStatus: filterAccountStatus,
//         //  health: filterHealth,
//         //  joinedDate: filterJoinedDate,
//         //  location: filterLocation,
//     });
//     const { data: userStats, isLoading: isLoadingUserStats, error: userStatsError } = useAdminUserStats();

//     const engagementStats = useMemo(() => [
//         {
//             value: userStats?.data?.stats.totalUsers.count.toString() ?? "0",
//             label: "Total users",
//             change: userStats?.data?.stats.totalUsers.delta.toString() ?? "0",
//             changeClass: "text-[#117346]",
//             iconBg: "bg-[#009D9D14]",
//             iconColor: "text-[#009D9D]",
//             icon: UsersGroupIcon,
//         },
//         {
//             value: userStats?.data?.stats.activeBuyers.count.toString() ?? "0",
//             label: "Active buyers",
//             change: userStats?.data?.stats.activeBuyers.delta.toString() ?? "0",
//             changeClass: "text-[#117346]",
//             iconBg: "bg-[#BE02BE14]",
//             iconColor: "text-[#BE02BE]",
//             icon: UserCheckIcon,
//         },
//         {
//             value: userStats?.data?.stats.activeSellers.count.toString() ?? "0",
//             label: "Active sellers",
//             change: userStats?.data?.stats.activeSellers.delta.toString() ?? "0",
//             changeClass: "text-[#117346]",
//             iconBg: "bg-[#1A1AFF14]",
//             iconColor: "text-[#1A1AFF]",
//             icon: UserPlusIcon,
//         },
//         {
//             value: userStats?.data?.stats.suspendedAccounts.count.toString() ?? "0",
//             label: "Suspended accounts",
//             change: userStats?.data?.stats.suspendedAccounts.delta.toString() ?? "0",
//             changeClass: "text-[#0B0E05A3]",
//             iconBg: "bg-[#DC680314]",
//             iconColor: "text-[#DC6803]",
//             icon: WarningIcon,
//         },
//     ] as const, [userStats]);

//     // Dataset matching canonical records perfectly
//     const verificationOptions = ["All statuses", "Pending", "In Review", "Needs info", "Approved", "Rejected"];
//     const accountStatusOptions = ["All", "Active", "Suspended"];
//     const dateOptions = ["All time", "Last 7 days", "Last 30 days", "Last 90 days"];
//     const staticLocations = ["All locations", "Philadelphia, PA 19107", "Cleveland, OH 44115", "San Francisco, CA 94103", "Orlando, FL 32801", "Atlanta, GA 30303"];

//     const userFilterBlueprints: FilterConfig[] = [
//         {
//             id: "complianceStatus",
//             label: "Compliance status",
//             defaultValue: "",
//             options: verificationOptions,
//             icon: userFilters[0].icon,
//         },
//         {
//             id: "accountStatus",
//             label: "Account status",
//             defaultValue: "All",
//             options: accountStatusOptions,
//             icon: userFilters[1].icon,
//         },
//         // {
//         //     id: "accountHealth",
//         //     label: "Account health",
//         //     defaultValue: "All health",
//         //     options: healthOptions,
//         //     icon: userFilters[2].icon,
//         // },
//         {
//             id: "joinedDate",
//             label: "Joined date",
//             defaultValue: "All time",
//             options: dateOptions,
//             icon: userFilters[3].icon,
//         },
//         {
//             id: "location",
//             label: "Location",
//             defaultValue: "All locations",
//             isSearchable: true,
//             searchPlaceholder: "Search location...",
//             options: staticLocations,
//             icon: userFilters[4].icon,
//         },
//     ];

//     const selectedUserFilters = useMemo(
//         () => ({
//             complianceStatus: filterComplianceStatus,
//             accountStatus: filterAccountStatus,
//             // accountHealth: filterHealth,
//             joinedDate: filterJoinedDate,
//             location: filterLocation,
//         }),
//         [filterComplianceStatus, filterAccountStatus, filterJoinedDate, filterLocation]
//     );

//     // const handleUserFilterChange = useCallback((filterId: string, value: string) => {
//     //     switch (filterId) {
//     //         case "verification":
//     //             setFilterComplianceStatus(value);
//     //             break;
//     //         case "status":
//     //             setFilterAccountStatus(value);
//     //             break;
//     //             // case "health":
//     //             //     setFilterHealth(value);
//     //             break;
//     //         case "joinedDate":
//     //             setFilterJoinedDate(value);
//     //             break;
//     //         case "location":
//     //             setFilterLocation(value);
//     //             break;
//     //     }
//     // }, []);

//     const handleUserFilterChange = useCallback((filterId: string, value: string) => {
//         setFilterParams((prevParams) => {
//             const updatedParams = {
//                 ...prevParams,
//                 [filterId]: value, // Dynamic key-value allocation
//             };

//             // Log out the active query params state mapping to the console
//             console.log("Updated Filter Query Parameters:", updatedParams);

//             return updatedParams;
//         });
//     }, []);

//     useEffect(() => {
//         console.log("filterParams", filterParams);
//     }, [filterParams]);


//     const formatUserFilterOptionLabel = useCallback(
//         (option: string) => (option === "All" ? "All statuses" : option),
//         []
//     );

//     const processedUsers = useMemo(() => {
//         const filteredUsers: any = usersData
//         return filteredUsers?.data.users.filter((user: any) => {
//             // if (activeSegmentTab === "Buyers" && user.accountType !== "BUYER ACCOUNT") return false;
//             // if (activeSegmentTab === "Sellers" && user.accountType !== "SELLER ACCOUNT") return false;

//             // if (searchQuery) {
//             //     const query = searchQuery.toLowerCase();
//             //     return user.firstName?.toLowerCase().includes(query) || user.lastName?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
//             // };

//             // if (filterVerification !== "All statuses" && user.verificationStatus !== filterVerification) return false;
//             // if (filterAccountStatus !== "All" && user.accountStatus !== filterAccountStatus) return false;

//             // if (filterHealth !== "All health") {
//             //     const h = user.accountHealth;
//             //     if (filterHealth === "75% - 100%" && (h < 75 || h > 100)) return false;
//             //     if (filterHealth === "50% - 75%" && (h < 50 || h >= 75)) return false;
//             //     if (filterHealth === "25% - 50%" && (h < 25 || h >= 50)) return false;
//             //     if (filterHealth === "0% - 25%" && h >= 25) return false;
//             // }

//             // if (filterLocation !== "All locations" && user.location !== filterLocation) return false;

//             return true;
//         }) ?? [];
//     }, [usersData, activeSegmentTab, searchQuery, filterComplianceStatus, filterAccountStatus, filterLocation]);

//     const activeFiltersCount = useMemo(() => {
//         let count = 0;
//         if (filterComplianceStatus !== "All statuses") count++;
//         if (filterAccountStatus !== "All") count++;
//         // if (filterHealth !== "All health") count++;
//         if (filterJoinedDate !== "") count++;
//         if (filterLocation !== "All locations") count++;
//         return count || 1;
//     }, [filterComplianceStatus, filterAccountStatus, filterJoinedDate, filterLocation]);

//     return (
//         <div className="w-full min-h-screen pb-24 md:pb-12">
//             {/* MAIN APP CONTAINER: Removed absolute padding on mobile to support edge-to-edge full width */}
//             <div className="mx-auto max-w-7xl md:p-6 md:space-y-6">
//                 {/* ENGAGEMENT STATS CARDS ROW */}
//                 <div className="p-4 md:p-0 space-y-4">
//                     <Typography type="text16" fontWeight={700} className=" block md:inline-block">
//                         Engagement stats
//                     </Typography>

//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                         {engagementStats.map((stat) => {
//                             const Icon = stat.icon;

//                             return (
//                                 <div
//                                     key={stat.label}
//                                     className={`${STAT_CARD_CLASS} h-28 p-4`}
//                                 >
//                                     <div className="flex items-start justify-between">
//                                         <div className="flex flex-col">
//                                             <Typography type="text24" fontWeight={700} className="text-[#0B0E05]">
//                                                 {stat.value}
//                                             </Typography>
//                                             <Typography type="text14" fontWeight={500} className="pt-0.5 text-[#0B0E05A3]">
//                                                 {stat.label}
//                                             </Typography>
//                                         </div>
//                                         <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
//                                             <Icon className={`h-5 w-5 ${stat.iconColor}`} />
//                                         </span>
//                                     </div>
//                                     <Typography type="text12" fontWeight={600} className="text-[#117346]">
//                                         <span className={`font-semibold ${stat.changeClass}`}>{stat.change}</span> this month
//                                     </Typography>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* MAIN USER DATA PLATFORM TAB CONTAINER: Made full screen width on mobile devices via responsive md variations */}
//                 <div className={`mt-4 w-full md:mt-0 ${PANEL_CARD_SHELL_CLASS}`}>
//                     <div className={PANEL_CARD_CLASS}>

//                         {/* Mobile segment tabs */}
//                         <div className="flex items-center gap-2.5 overflow-x-auto px-4 py-3 scrollbar-none md:hidden">
//                             {(["Buyer", "Seller", "Reported"] as const).map((tab) => {
//                                 const isSelected: boolean = activeSegmentTab === (tab.toLocaleLowerCase() as "buyer" | "seller" | "reported");;

//                                 return (
//                                     <button
//                                         key={tab}
//                                         type="button"
//                                         onClick={() => setActiveSegmentTab(tab.toLocaleLowerCase() as "buyer" | "seller" | "reported")}
//                                         className={`shrink-0 rounded-full border px-5 py-2.5 transition-all duration-150 ${isSelected
//                                             ? "border-[#65A30D] bg-[#84CC16]/10 text-[#518300]"
//                                             : "border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05A3]"
//                                             }`}
//                                     >
//                                         <Typography type="text14" fontWeight={isSelected ? 600 : 500} className={isSelected ? "text-[#518300]" : "!text-[#0B0E05A3]"}>
//                                             {`${tab}s`}
//                                             {tab === "Reported" && (
//                                                 <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold text-white">
//                                                     {formatCount(REPORTED_COUNT)}
//                                                 </span>
//                                             )}
//                                         </Typography>
//                                     </button>
//                                 );
//                             })}
//                         </div>

//                         {/* Desktop segment tabs */}
//                         <div className="hidden items-center gap-8 whitespace-nowrap border-b border-[#0B0E0514] px-6 md:flex">
//                             {(["Buyer", "Seller", "Reported"] as const).map((tab) => {
//                                 const isSelected = activeSegmentTab === (tab.toLocaleLowerCase() as "buyer" | "seller" | "reported");

//                                 return (
//                                     <React.Fragment key={tab}>
//                                         {tab === "Reported" && (
//                                             <div className="h-5 w-px shrink-0 bg-[#0B0E0529]" />
//                                         )}
//                                         <button
//                                             type="button"
//                                             onClick={() => setActiveSegmentTab(tab.toLocaleLowerCase() as "buyer" | "seller" | "reported")}
//                                             className={`relative flex shrink-0 items-center gap-2 py-2.5 transition-colors ${isSelected ? "text-[#518300]" : "!text-[#0B0E05A3] hover:text-[#0B0E05]"}`}
//                                         >
//                                             <Typography
//                                                 type="text14"
//                                                 fontWeight={isSelected ? 600 : 500}
//                                                 className={isSelected ? "text-[#518300]" : "!text-[#0B0E05A3]"}
//                                             >
//                                                 {`${tab}s`}
//                                             </Typography>
//                                             {tab === "Reported" && (
//                                                 <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold leading-none text-white">
//                                                     {formatCount(REPORTED_COUNT)}
//                                                 </span>
//                                             )}
//                                             {isSelected && (
//                                                 <div className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full bg-[#518300]" />
//                                             )}
//                                         </button>
//                                     </React.Fragment>
//                                 );
//                             })}
//                         </div>

//                         {/* FILTER BAR & SEARCH CONTROLS */}
//                         <div className="p-4 md:p-6 space-y-4">
//                             <div className="flex items-center gap-3">
//                                 <SearchInput
//                                     containerClassName="flex-1"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     placeholder="Search people by name or email..."
//                                     className="py-2.5"
//                                 />

//                                 <button
//                                     type="button"
//                                     onClick={() => { }}
//                                     aria-label="Open filters"
//                                     className="relative rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-2.5 text-[#0B0E05CC] focus:outline-none md:hidden"
//                                 >
//                                     <SlidersHorizontalIcon className="h-5 w-5 text-[#343330]" />
//                                     <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#CC2929] text-[9px] font-bold text-white">
//                                         {formatCount(activeFiltersCount)}
//                                     </span>
//                                 </button>
//                             </div>

//                             <div className="hidden md:block">
//                                 <DynamicFilters
//                                     filters={userFilterBlueprints}
//                                     selectedValues={selectedUserFilters}
//                                     onFilterChange={handleUserFilterChange}
//                                     className="relative z-30 flex flex-wrap items-center gap-2.5"
//                                     formatOptionLabel={formatUserFilterOptionLabel}
//                                 />
//                             </div>
//                         </div>

//                         {/* DESKTOP DATA GRID */}
//                         <div className="hidden md:block w-full overflow-x-auto">
//                             <table className="w-full min-w-[960px] border-collapse text-left">
//                                 <thead>
//                                     <tr className="border-b border-[#0B0E0514] bg-[#0B0E050A]">
//                                         {["S/N", "User", "Email", "Orders", "Last active", "Account status", "Verification", ""].map((head, i) => (
//                                             <th
//                                                 key={i}
//                                                 className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0B0E05A3]"
//                                             >
//                                                 {head}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>

//                                 <tbody className="divide-y divide-[#0B0E0514]">
//                                     {processedUsers?.map((row: any, index: number, array: any[]) => {
//                                         const isNearBottom = index >= array.length - 3;

//                                         return (
//                                             <tr key={index} className="transition-colors hover:bg-[#0B0E050A]">
//                                                 <td className="px-6 py-4 text-sm font-bold text-[#0B0E05]">{index + 1}.</td>
//                                                 <td className="px-6 py-4">
//                                                     <div className="flex items-center gap-3">
//                                                         <ProfileAvatar
//                                                             imageUrl={row.avatarUrl}
//                                                             name={row.firstName + " " + row.lastName}
//                                                             size="sm"
//                                                         />
//                                                         <span className="text-sm font-semibold text-[#0B0E05]">{row.firstName ?? "---"} {row.lastName ?? "---"}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 text-sm font-medium text-[#0B0E05A3]">{row.email}</td>
//                                                 <td className="px-6 py-4 text-sm text-[#0B0E05A3]">{row.totalOrders ?? "---"}</td>
//                                                 <td className="px-6 py-4 text-sm text-[#0B0E05A3]">{row.lastActive ?? "---"}</td>
//                                                 <td className="px-6 py-4">
//                                                     <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${row.accountStatus === "Active" ? "bg-[#00A34114] text-[#00A341]" : "bg-[#DC680314] text-[#DC6803]"}`}>
//                                                         {row.accountStatus}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold ${row.verificationStatus === "Approved" ? "bg-[#00A34114] text-[#00A341]" :
//                                                         row.verificationStatus === "Pending" ? "bg-[#DC680314] text-[#DC6803]" :
//                                                             row.verificationStatus === "In Review" ? "bg-[#0B0E050A] text-[#0B0E05A3]" :
//                                                                 row.verificationStatus === "Needs info" ? "bg-[#1A1AFF14] text-[#1A1AFF]" : "bg-[#CC292914] text-[#CC2929]"
//                                                         }`}>
//                                                         {row.complianceReviewStatus}
//                                                     </span>
//                                                 </td>
//                                                 <td className="relative px-6 py-4 text-right">
//                                                     <UserActionMenu
//                                                         isOpen={actionMenuUserSn === index + 1}
//                                                         onToggle={() => setActionMenuUserSn(actionMenuUserSn === index + 1 ? null : index + 1)}
//                                                         onClose={() => setActionMenuUserSn(null)}
//                                                         placement={isNearBottom ? "bottom" : "top"}
//                                                     />
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* MOBILE CARD LIST: Edge-to-edge layout with full width divider lines */}
//                         <div className="block w-full divide-y divide-[#0B0E0514] border-t border-[#0B0E0514] md:hidden">
//                             {processedUsers?.map((row: any, index: number) => (
//                                 <div key={index} className="flex flex-col space-y-3.5 bg-[#FFFFFF] p-4 transition-colors hover:bg-[#0B0E050A]">

//                                     {/* TOP ROW: Avatar + Name + Type Grouped Safely */}
//                                     <div className="flex items-center justify-between">
//                                         <div className="flex items-center gap-3.5">
//                                             <ProfileAvatar
//                                                 imageUrl={row.avatarUrl}
//                                                 name={row.firstName + " " + row.lastName}
//                                                 size="sm"
//                                             />
//                                             <div>
//                                                 <Typography type="text16" fontWeight={700} className=" leading-tight">
//                                                     {row.firstName + row.lastName}
//                                                 </Typography>
//                                                 <span className="text-[10px] font-bold text-[#4D7C0F] tracking-wider block mt-0.5">
//                                                     {row.accountType ?? "---"}
//                                                 </span>
//                                             </div>
//                                         </div>

//                                         <div className="pt-0.5">
//                                             <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${row.accountStatus === "active" ? "bg-[#00A34114] text-[#00A341]" : "bg-[#DC680314] text-[#DC6803]"}`}>
//                                                 {row.accountStatus ?? "---"}
//                                             </span>
//                                         </div>
//                                     </div>

//                                     {/* BOTTOM ROW: Active details and orders touching full-width edges */}
//                                     <div className="flex items-center justify-between pt-0.5">
//                                         <span className="text-xs text-[#0B0E05A3]">
//                                             Active: <span className="font-bold text-[#0B0E05]">{row.lastActive ?? "---"}</span>
//                                         </span>
//                                         <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
//                                             {row.totalOrders} orders
//                                         </Typography>
//                                     </div>

//                                 </div>
//                             ))}

//                             {/* Full Width Button container */}
//                             <div className="p-4 flex justify-center bg-[#FFFFFF]">
//                                 <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#0B0E0514] bg-[#0B0E050A] px-6 py-2.5 text-xs font-bold text-[#0B0E05] shadow-card transition-colors active:bg-[#0B0E050A] sm:w-auto">
//                                     <span>Load more</span>
//                                     <div className="h-4 w-4 rounded-sm bg-[#0B0E05A3]" />
//                                 </button>
//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             </div>

//             {/* MOBILE CONTEXTUAL FOOTER BAR */}
//             <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-[#0B0E0514] bg-[#FFFFFF] px-6 py-2.5 shadow-card md:hidden">
//                 <button className="flex flex-col items-center gap-0.5 text-[#0B0E05A3]">
//                     <div className="h-5 w-5 rounded-sm bg-[#0B0E05A3]" />
//                 </button>
//                 <button className="flex flex-col items-center gap-0.5 text-[#0B0E05A3]">
//                     <div className="h-5 w-5 rounded-sm bg-[#0B0E05A3]" />
//                 </button>
//                 <button className="flex flex-col items-center gap-0.5 text-[#0B0E05A3]">
//                     <div className="h-5 w-5 rounded-sm bg-[#0B0E05A3]" />
//                 </button>
//                 <button className="flex flex-col items-center gap-0.5 rounded-full border border-[#A3E635]/30 bg-[#E2F5C8] p-2 px-4 text-[#518300]">
//                     <div className="h-5 w-5 rounded-sm bg-[#518300]" />
//                 </button>
//                 <button className="flex flex-col items-center gap-0.5 text-[#0B0E05A3]">
//                     <div className="h-5 w-5 rounded-sm bg-[#0B0E05A3]" />
//                 </button>
//             </div>

//         </div>
//     );
// }

"use client";

import { EmptyState } from "@/components/empty-state";
import {
    AdminAsyncContent,
    AdminQueryState,
    DataTableSkeleton,
    ListRowsSkeleton,
    StatCardsSkeleton,
} from "@/components/skeletons";
import DynamicFilters, { type FilterConfig } from "@/components/dynamic-filters";
import { ProfileAvatar } from "@/components/profile-avatar";
import SearchInput from "@/components/search-input";
import Typography from "@/components/typography";
import UserActionMenu from "@/components/user-action-menu";
import {
    AllUsersIcon,
    CalendarDotsIcon,
    FirstAidIcon,
    MapPinIcon,
    ShieldIcon,
    SlidersHorizontalIcon,
    UserCheckIcon,
    UserPlusIcon,
    UsersGroupIcon,
    WarningIcon,
} from "@/components/vector";
import { useAdminUsers, useAdminUserStats, useAdminUserTabCounts } from "@/lib/admin/hooks";
import { PANEL_CARD_CLASS, PANEL_CARD_SHELL_CLASS, STAT_CARD_CLASS } from "@/lib/card-styles";
import { formatCount } from "@/lib/format-count";
import {
    getUserAccountStatusStyles,
    getUserVerificationStatusStyles,
} from "@/lib/users/utilities/user-status-styles";
import React, { useCallback, useMemo, useState } from "react";

const USER_SEGMENT_TABS = [
    { id: "buyer" as const, label: "Buyers", countKey: "buyers" as const },
    { id: "seller" as const, label: "Sellers", countKey: "sellers" as const },
    { id: "reported" as const, label: "Reported", countKey: "reported" as const },
];

const userFilters = [
    {
        id: "verification",
        label: "Verification status",
        icon: <ShieldIcon className="h-[16px] w-[15px] text-[#343330]" />,
    },
    {
        id: "status",
        label: "Account status",
        icon: <AllUsersIcon className="h-5 w-5 text-[#343330]" />,
    },
    {
        id: "health",
        label: "Account health",
        icon: <FirstAidIcon className="h-5 w-5 text-[#343330]" />,
    },
    {
        id: "joinedDate",
        label: "Joined date",
        icon: <CalendarDotsIcon className="h-5 w-5 text-[#343330]" />,
    },
    {
        id: "location",
        label: "Location",
        icon: <MapPinIcon className="h-5 w-5 text-[#343330]" />,
    },
] as const;

export default function AllUsersBody() {
    // Navigation segment tab states
    const [activeSegmentTab, setActiveSegmentTab] = useState<"buyer" | "seller" | "reported">("buyer");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionMenuUserSn, setActionMenuUserSn] = useState<number | null>(null);

    // Unified operational state for API filter query parameters
    const [filterParams, setFilterParams] = useState<Record<string, string>>({});

    // API Hooks passing parameters dynamically from state
    const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useAdminUsers({
        ...filterParams,
        accountType: activeSegmentTab,
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
    });

    const { data: userStats, isLoading: isLoadingUserStats, error: userStatsError } = useAdminUserStats();

    const engagementStats = useMemo(() => [
        {
            value: userStats?.data?.stats.totalUsers.count.toString() ?? "0",
            label: "Total users",
            change: userStats?.data?.stats.totalUsers.delta.toString() ?? "0",
            changeClass: "text-[#117346]",
            iconBg: "bg-[#009D9D14]",
            iconColor: "text-[#009D9D]",
            icon: UsersGroupIcon,
        },
        {
            value: userStats?.data?.stats.activeBuyers.count.toString() ?? "0",
            label: "Active buyers",
            change: userStats?.data?.stats.activeBuyers.delta.toString() ?? "0",
            changeClass: "text-[#117346]",
            iconBg: "bg-[#BE02BE14]",
            iconColor: "text-[#BE02BE]",
            icon: UserCheckIcon,
        },
        {
            value: userStats?.data?.stats.activeSellers.count.toString() ?? "0",
            label: "Active sellers",
            change: userStats?.data?.stats.activeSellers.delta.toString() ?? "0",
            changeClass: "text-[#117346]",
            iconBg: "bg-[#1A1AFF14]",
            iconColor: "text-[#1A1AFF]",
            icon: UserPlusIcon,
        },
        {
            value: userStats?.data?.stats.suspendedAccounts.count.toString() ?? "0",
            label: "Suspended accounts",
            change: userStats?.data?.stats.suspendedAccounts.delta.toString() ?? "0",
            changeClass: "text-[#0B0E05A3]",
            iconBg: "bg-[#DC680314]",
            iconColor: "text-[#DC6803]",
            icon: WarningIcon,
        },
    ] as const, [userStats]);

    const verificationOptions = ["All statuses", "Pending", "In Review", "Needs info", "Approved", "Rejected"];
    const accountStatusOptions = ["All", "Active", "Suspended"];
    const dateOptions = ["All time", "Last 7 days", "Last 30 days", "Last 90 days"];
    const staticLocations = ["All locations", "Philadelphia, PA 19107", "Cleveland, OH 44115", "San Francisco, CA 94103", "Orlando, FL 32801", "Atlanta, GA 30303"];

    const userFilterBlueprints: FilterConfig[] = [
        {
            id: "complianceStatus",
            label: "Compliance status",
            defaultValue: "",
            options: verificationOptions,
            icon: userFilters[0].icon,
        },
        {
            id: "accountStatus",
            label: "Account status",
            defaultValue: "All",
            options: accountStatusOptions,
            icon: userFilters[1].icon,
        },
        {
            id: "joinedDate",
            label: "Joined date",
            defaultValue: "All time",
            options: dateOptions,
            icon: userFilters[3].icon,
        },
        {
            id: "location",
            label: "Location",
            defaultValue: "All locations",
            isSearchable: true,
            searchPlaceholder: "Search location...",
            options: staticLocations,
            icon: userFilters[4].icon,
        },
    ];

    const selectedUserFilters = useMemo(
        () => ({
            complianceStatus: filterParams.complianceStatus,
            accountStatus: filterParams.accountStatus,
            joinedDate: filterParams.joinedDate,
            location: filterParams.location,
        }),
        [filterParams]
    );

    const handleUserFilterChange = useCallback((filterId: string, value: string) => {
        setFilterParams((prevParams) => {
            // Create a shallow copy of the previous parameters
            const updatedParams = { ...prevParams };

            // Define terms that signify an inactive/clear filter state
            const isDefaultValue =
                value === "" ||
                value.toLowerCase() === "all" ||
                value.toLowerCase() === "all statuses" ||
                value.toLowerCase() === "all locations" ||
                value.toLowerCase() === "all time";

            if (isDefaultValue) {
                // Remove the key entirely so it won't be sent as a query parameter
                delete updatedParams[filterId];
            } else {
                // Set or overwrite with the new active value
                updatedParams[filterId] = value.toLocaleLowerCase().trim();
            }

            // console.log("Updated Filter Query Parameters:", updatedParams);
            return updatedParams;
        });
    }, []);

    // useEffect(() => {
    //     console.log("filterParams changed:", filterParams);
    // }, [filterParams]);

    const formatUserFilterOptionLabel = useCallback(
        (option: string) => (option === "Alll" ? "All statuses" : option),
        []
    );

    const processedUsers = useMemo(() => {
        const filteredUsers: any = usersData;
        return filteredUsers?.data?.users.filter((user: any) => {
            // Note: Data is filtered via API query parameters now. 
            // Local client filtering rules can be safely toggled back on here if needed.
            return true;
        }) ?? [];
    }, [usersData]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filterParams.complianceStatus !== "All statuses" && filterParams.complianceStatus !== "") count++;
        if (filterParams.accountStatus !== "All") count++;
        if (filterParams.joinedDate !== "All time" && filterParams.joinedDate !== "") count++;
        if (filterParams.location !== "All locations") count++;
        return count || 1;
    }, [filterParams]);

    return (
        <div className="w-full min-h-screen pb-24 md:pb-12">
            <div className="mx-auto max-w-7xl md:p-6 md:space-y-6">

                {/* ENGAGEMENT STATS CARDS ROW */}
                <div className="p-4 md:p-0 space-y-4">
                    <Typography type="text16" fontWeight={700} className=" block md:inline-block">
                        Engagement stats
                    </Typography>

                    {isLoadingUserStats ? (
                        <StatCardsSkeleton
                            count={4}
                            tall
                            columnsClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                        />
                    ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {engagementStats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div key={stat.label} className={`${STAT_CARD_CLASS} h-28 p-4`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <Typography type="text24" fontWeight={700} className="text-[#0B0E05]">
                                                {stat.value}
                                            </Typography>
                                            <Typography type="text14" fontWeight={500} className="pt-0.5 text-[#0B0E05A3]">
                                                {stat.label}
                                            </Typography>
                                        </div>
                                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                                            <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                                        </span>
                                    </div>
                                    <Typography type="text12" fontWeight={600} className="text-[#117346]">
                                        <span className={`font-semibold ${stat.changeClass}`}>{stat.change}</span> this month
                                    </Typography>
                                </div>
                            );
                        })}
                    </div>
                    )}
                </div>

                {/* MAIN USER DATA PLATFORM TAB CONTAINER */}
                <div className={`mt-4 w-full md:mt-0 ${PANEL_CARD_SHELL_CLASS}`}>
                    <div className={PANEL_CARD_CLASS}>

                        {/* Mobile segment tabs */}
                        <div className="flex items-center gap-2.5 overflow-x-auto px-4 py-3 scrollbar-none md:hidden">
                            {segmentTabs.map((tab) => {
                                const isSelected: boolean = activeSegmentTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveSegmentTab(tab.id)}
                                        className={`shrink-0 rounded-full border px-5 py-2.5 transition-all duration-150 ${isSelected
                                            ? "border-[#65A30D] bg-[#84CC16]/10 text-[#518300]"
                                            : "border-[#0B0E0514] bg-[#FFFFFF] text-[#0B0E05A3]"
                                            }`}
                                    >
                                        <Typography type="text14" fontWeight={isSelected ? 600 : 500} className={`flex items-center gap-2 ${isSelected ? "text-[#518300]" : "!text-[#0B0E05A3]"}`}>
                                            {`${tab.label}`}
                                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold leading-none text-white">
                                                {formatCount(tab.count)}
                                            </span>
                                        </Typography>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Desktop segment tabs */}
                        <div className="hidden items-center gap-8 whitespace-nowrap border-b border-[#0B0E0514] px-6 md:flex">
                            {segmentTabs.map((tab) => {
                                const isSelected = activeSegmentTab === tab.id;

                                return (
                                    <React.Fragment key={tab.id}>
                                        {tab.id === "reported" && (
                                            <div className="h-5 w-px shrink-0 bg-[#0B0E0529]" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setActiveSegmentTab(tab.id)}
                                            className={`relative flex shrink-0 items-center gap-2 py-2.5 transition-colors ${isSelected ? "text-[#518300]" : "!text-[#0B0E05A3] hover:text-[#0B0E05]"}`}
                                        >
                                            <Typography
                                                type="text14"
                                                fontWeight={isSelected ? 600 : 500}
                                                className={isSelected ? "text-[#518300]" : "!text-[#0B0E05A3]"}
                                            >
                                                {`${tab.label}`}
                                            </Typography>
                                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#CC2929] px-1.5 text-[11px] font-bold leading-none text-white">
                                                {formatCount(tab.count)}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full bg-[#518300]" />
                                            )}
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* FILTER BAR & SEARCH CONTROLS */}
                        <div className="p-4 md:p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <SearchInput
                                    containerClassName="flex-1"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search people by name or email..."
                                    className="py-2.5"
                                />

                                <button
                                    type="button"
                                    onClick={() => { }}
                                    aria-label="Open filters"
                                    className="relative rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-2.5 text-[#0B0E05CC] focus:outline-none md:hidden"
                                >
                                    <SlidersHorizontalIcon className="h-5 w-5 text-[#343330]" />
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#CC2929] text-[9px] font-bold text-white">
                                        {formatCount(activeFiltersCount)}
                                    </span>
                                </button>
                            </div>

                            <div className="hidden md:block">
                                <DynamicFilters
                                    filters={userFilterBlueprints}
                                    selectedValues={selectedUserFilters}
                                    onFilterChange={handleUserFilterChange}
                                    className="relative z-30 flex flex-wrap items-center gap-2.5"
                                    formatOptionLabel={formatUserFilterOptionLabel}
                                />
                            </div>
                        </div>

                        {/* DESKTOP DATA GRID */}
                        <div className="hidden md:block w-full overflow-x-auto">
                            <table className="w-full min-w-[960px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-[#0B0E0514] bg-[#0B0E050A]">
                                        {["S/N", "User", "Email", "Orders", "Last active", "Account status", "Verification", ""].map((head, i) => (
                                            <th key={i} className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0B0E05A3]">
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#0B0E0514]">
                                    <AdminAsyncContent
                                        isLoading={isLoadingUsers}
                                        isEmpty={processedUsers.length === 0}
                                        loadingFallback={
                                            <tr>
                                                <td colSpan={8}>
                                                    <DataTableSkeleton rows={6} columns={8} />
                                                </td>
                                            </tr>
                                        }
                                        emptyFallback={
                                            <tr>
                                                <td colSpan={8}>
                                                    <EmptyState title="No users found" />
                                                </td>
                                            </tr>
                                        }
                                    >
                                    {processedUsers?.map((row: any, index: number, array: any[]) => {
                                        const isNearBottom = index >= array.length - 3;

                                        return (
                                            <tr key={index} className="transition-colors hover:bg-[#0B0E050A]">
                                                <td className="px-6 py-4 text-sm font-bold text-[#0B0E05]">{index + 1}.</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <ProfileAvatar
                                                            imageUrl={row.avatarUrl}
                                                            name={row.firstName + " " + row.lastName}
                                                            size="sm"
                                                        />
                                                        <span className="text-sm font-semibold text-[#0B0E05]">{row.firstName ?? "---"} {row.lastName ?? "---"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-[#0B0E05A3]">{row.email}</td>
                                                <td className="px-6 py-4 text-sm text-[#0B0E05A3]">{row.totalOrders ?? "---"}</td>
                                                <td className="px-6 py-4 text-sm text-[#0B0E05A3]">{row.lastActive ?? "---"}</td>
                                                <td className="px-6 py-4">
                                                    <span className={getUserAccountStatusStyles(row.accountStatus)}>
                                                        {row.accountStatus ?? "—"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={getUserVerificationStatusStyles(row.complianceReviewStatus ?? row.verificationStatus)}>
                                                        {row.complianceReviewStatus ?? row.verificationStatus ?? "—"}
                                                    </span>
                                                </td>
                                                <td className="relative px-6 py-4 text-right">
                                                    <UserActionMenu
                                                        userDetails={row}
                                                        isOpen={actionMenuUserSn === index + 1}
                                                        onToggle={() => setActionMenuUserSn(actionMenuUserSn === index + 1 ? null : index + 1)}
                                                        onClose={() => setActionMenuUserSn(null)}
                                                        placement={isNearBottom ? "bottom" : "top"}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </AdminAsyncContent>
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARD LIST */}
                        <div className="block w-full divide-y divide-[#0B0E0514] border-t border-[#0B0E0514] md:hidden">
                            <AdminAsyncContent
                                isLoading={isLoadingUsers}
                                isEmpty={processedUsers.length === 0}
                                loadingFallback={<ListRowsSkeleton rows={5} className="p-4" />}
                                emptyFallback={<EmptyState title="No users found" />}
                            >
                            {processedUsers?.map((row: any, index: number) => (
                                <div key={index} className="flex flex-col space-y-3.5 bg-[#FFFFFF] p-4 transition-colors hover:bg-[#0B0E050A]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3.5">
                                            <ProfileAvatar
                                                imageUrl={row.avatarUrl}
                                                name={row.firstName + " " + row.lastName}
                                                size="sm"
                                            />

                                            <div>
                                                <Typography type="text16" fontWeight={700} className=" leading-tight">
                                                    {row.firstName ?? "---"} {row.lastName ?? "---"}
                                                </Typography>
                                                <span className="text-[10px] font-bold text-[#4D7C0F] tracking-wider block mt-0.5">
                                                    {/* {row.accountType ?? "---"} {row.accountType === "Buyer" ? "Buyer" : "Seller*"} */}
                                                    {row.accountType ?? "---"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-0.5">
                                            <span className={getUserAccountStatusStyles(row.accountStatus)}>
                                                {row.accountStatus ?? "—"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-0.5">
                                        <span className="text-xs text-[#0B0E05A3]">
                                            Active: <span className="font-bold text-[#0B0E05]">{row.lastActive ?? "---"}</span>
                                        </span>
                                        <Typography type="text14" fontWeight={700} className="text-[#0B0E05]">
                                            {row.totalOrders} orders
                                        </Typography>
                                    </div>
                                </div>
                            ))}
                            </AdminAsyncContent>

                            <div className="p-4 flex justify-center bg-[#FFFFFF]">
                                <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#0B0E0514] bg-[#0B0E050A] px-6 py-2.5 text-xs font-bold text-[#0B0E05] shadow-card transition-colors active:bg-[#0B0E050A] sm:w-auto">
                                    <span>Load more</span>
                                    <div className="h-4 w-4 rounded-sm bg-[#0B0E05A3]" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* MOBILE CONTEXTUAL FOOTER BAR */}
            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-[#0B0E0514] bg-[#FFFFFF] px-6 py-2.5 shadow-card md:hidden">
                <button className="flex flex-col items-center gap-0.5 text-[#0B0E05A3]">
                    <div className="h-5 w-5 rounded-sm bg-[#0B0E05A3]" />
                </button>
                <button className="flex flex-col items-center gap-0.5 text-[#0B0E05A3]">
                    <div className="h-5 w-5 rounded-sm bg-[#0B0E05A3]" />
                </button>
                <button className="flex flex-col items-center gap-0.5 text-[#0B0E05A3]">
                    <div className="h-5 w-5 rounded-sm bg-[#0B0E05A3]" />
                </button>
                <button className="flex flex-col items-center gap-0.5 rounded-full border border-[#A3E635]/30 bg-[#E2F5C8] p-2 px-4 text-[#518300]">
                    <div className="h-5 w-5 rounded-sm bg-[#518300]" />
                </button>
                <button className="flex flex-col items-center gap-0.5 text-[#0B0E05A3]">
                    <div className="h-5 w-5 rounded-sm bg-[#0B0E05A3]" />
                </button>
            </div>
        </div>
    );
}