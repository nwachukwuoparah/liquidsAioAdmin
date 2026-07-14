import type {
    AdminComplianceReviewRecord,
    AdminComplianceStatRecord,
    AdminInventoryLotRecord,
    AdminInventoryStatsRecord,
    AdminInventoryTabCounts,
    AdminOrderRecord,
    AdminOrderStatRecord,
    AdminOverviewActivityRecord,
    AdminOverviewDashboardData,
    AdminOverviewStatRecord,
    AdminRfqRecord,
    AdminRfqTabCounts,
    AdminSettingsGeneralData,
    AdminSettingsProfileData,
    AdminTeamMemberRecord,
    AdminUserRecord,
    AdminUserStatRecord,
    AdminUserTabCounts,
} from "@/lib/admin/types/admin-api.types";
import { CATEGORY_GMV_DATA } from "@/lib/overview/chart-data";
import { getTrendDataForRange } from "@/lib/overview/chart-data";

export const SAMPLE_ADMIN_ORDERS: AdminOrderRecord[] = [
    { id: "1.", orderId: "#ORD-2024-001", title: "Mixed Electronics Pallet – Headphones, Speakers, Chargers", seller: "Savannah Nguyen", buyer: "John Peters", amount: "$9,000", payStatus: "In Escrow", orderStatus: "Awaiting shipment", date: "05-07-2025", colorBg: "bg-amber-100" },
    { id: "2.", orderId: "#ORD-2024-002", title: "Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)", seller: "Ronald Richards", buyer: "Wade Warren", amount: "$1,500", payStatus: "Released", orderStatus: "Awaiting shipment", date: "04-07-2025", colorBg: "bg-blue-100" },
    { id: "3.", orderId: "#ORD-2024-003", title: "Kitchenware Overstock – 2 Pallets (Cookware & Utensils)", seller: "Robert Fox", buyer: "Kathryn Murphy", amount: "$800", payStatus: "Released", orderStatus: "In-transit", date: "03-07-2025", colorBg: "bg-[#0B0E050A]" },
    { id: "4.", orderId: "#ORD-2024-004", title: "Beauty & Cosmetics Lot – 500 Mixed Units", seller: "Marvin McKinney", buyer: "Ronald Richards", amount: "$1,200", payStatus: "In Escrow", orderStatus: "Awaiting shipment", date: "05-07-2025", colorBg: "bg-red-100" },
    { id: "5.", orderId: "#ORD-2024-002", title: "Baby Products Pallet – Diapers, Toys, Accessories", seller: "John stockton", buyer: "Cameron Williamson", amount: "$950", payStatus: "Released", orderStatus: "Delivered", date: "05-07-2025", colorBg: "bg-purple-100" },
    { id: "6.", orderId: "#ORD-2024-002", title: "Automotive Accessories – 150 Mixed Items", seller: "Cameron Williamson", buyer: "Marvin McKinney", amount: "$1,700", payStatus: "In Escrow", orderStatus: "Dispute", date: "05-07-2025", colorBg: "bg-emerald-100" },
    { id: "7.", orderId: "#ORD-2024-002", title: "Grocery Shelf Pulls – Snacks & Beverages", seller: "Wade Warren", buyer: "Robert Fox", amount: "$600", payStatus: "Refunded", orderStatus: "Cancelled", date: "05-07-2025", colorBg: "bg-amber-100" },
    { id: "8.", orderId: "#ORD-2024-002", title: "Office Supplies Pallet – Printers, Paper, Toners", seller: "Kathryn Murphy", buyer: "Savannah Nguyen", amount: "$1,100", payStatus: "Refunded", orderStatus: "Order completed", date: "05-07-2025", colorBg: "bg-indigo-100" },
];

export const SAMPLE_ADMIN_ORDER_STATS: AdminOrderStatRecord[] = [
    { title: "Total Orders (YTD)", count: "2,486", change: "+145", trendDirection: "up", isPositive: true, iconKey: "truck", iconBg: "bg-[#BE02BE14]", iconColor: "text-[#BE02BE]" },
    { title: "Active Orders", count: "307", change: "+12%", trendDirection: "up", isPositive: true, iconKey: "thumbsUp", iconBg: "bg-[#00A34114]", iconColor: "text-[#00A341]" },
    { title: "Completed Orders", count: "115", change: "+3%", trendDirection: "up", isPositive: true, iconKey: "checkCircle", iconBg: "bg-[#00A34114]", iconColor: "text-[#00A341]" },
    { title: "Disputed Orders", count: "19", change: "-2%", trendDirection: "down", isPositive: true, iconKey: "flag", iconBg: "bg-[#CC292914]", iconColor: "text-[#CC2929]", iconClassName: "h-4 w-[15px]" },
    { title: "All Refunds Issued", count: "30", change: "+3%", trendDirection: "up", isPositive: false, iconKey: "arrowUUpLeft", iconBg: "bg-[#CC292914]", iconColor: "text-[#CC2929]" },
    { title: "Currently in Escrow", count: "$49,500", change: "+3%", trendDirection: "up", isPositive: true, iconKey: "arrowsLeftRight", iconBg: "bg-[#BE02BE14]", iconColor: "text-[#BE02BE]" },
    { title: "Avg. Order Value", count: "$2,342", change: "+5%", trendDirection: "up", isPositive: true, iconKey: "truck", iconBg: "bg-[#1A1AFF14]", iconColor: "text-[#1A1AFF]" },
    { title: "Platform Fees Earning", count: "$3,209", change: "-12%", trendDirection: "down", isPositive: false, iconKey: "handCoins", iconBg: "bg-[#DC680314]", iconColor: "text-[#DC6803]" },
];

// export const SAMPLE_ADMIN_USER_STATS: AdminUserStatRecord[] = [
//     { value: "3,598", label: "Total users", change: "+145", changeClass: "text-[#117346]", iconKey: "usersGroup", iconBg: "bg-[#009D9D14]", iconColor: "text-[#009D9D]" },
//     { value: "2,245", label: "Active buyers", change: "+23", changeClass: "text-[#117346]", iconKey: "userCheck", iconBg: "bg-[#BE02BE14]", iconColor: "text-[#BE02BE]" },
//     { value: "1,223", label: "Active sellers", change: "+89", changeClass: "text-[#117346]", iconKey: "userPlus", iconBg: "bg-[#1A1AFF14]", iconColor: "text-[#1A1AFF]" },
//     { value: "89", label: "Suspended accounts", change: "+6", changeClass: "text-[#0B0E05A3]", iconKey: "warning", iconBg: "bg-[#DC680314]", iconColor: "text-[#DC6803]" },
// ];

export const SAMPLE_ADMIN_USER_TAB_COUNTS: AdminUserTabCounts = {
    buyers: 4,
    sellers: 4,
    reported: 2,
};

export const SAMPLE_ADMIN_USERS: AdminUserRecord[] = [
    { id: "1.", name: "John Peters", email: "john@buyer.com", role: "Buyer", location: "California, USA", status: "Active", health: "Good", verification: "Verified", lastActive: "2 mins ago", avatarBg: "bg-slate-200", avatarText: "JP", segment: "buyers" },
    { id: "2.", name: "Savannah Nguyen", email: "savannah@seller.com", role: "Seller", location: "Texas, USA", status: "Active", health: "Good", verification: "Verified", lastActive: "5 mins ago", avatarBg: "bg-amber-100", avatarText: "SN", segment: "sellers" },
    { id: "3.", name: "Ronald Richards", email: "ronald@seller.com", role: "Seller", location: "Florida, USA", status: "Suspended", health: "At risk", verification: "Verified", lastActive: "Yesterday", avatarBg: "bg-blue-100", avatarText: "RR", segment: "reported" },
    { id: "4.", name: "Kathryn Murphy", email: "kathryn@buyer.com", role: "Buyer", location: "New York, USA", status: "Active", health: "Good", verification: "Pending", lastActive: "1 hour ago", avatarBg: "bg-emerald-100", avatarText: "KM", segment: "buyers" },
    { id: "5.", name: "Marvin McKinney", email: "marvin@seller.com", role: "Seller", location: "Georgia, USA", status: "Active", health: "Good", verification: "Verified", lastActive: "3 hours ago", avatarBg: "bg-rose-100", avatarText: "MM", segment: "sellers" },
    { id: "6.", name: "Wade Warren", email: "wade@buyer.com", role: "Buyer", location: "Ohio, USA", status: "Active", health: "Good", verification: "Verified", lastActive: "Today", avatarBg: "bg-indigo-100", avatarText: "WW", segment: "buyers" },
    { id: "7.", name: "Robert Fox", email: "robert@seller.com", role: "Seller", location: "Arizona, USA", status: "Active", health: "Good", verification: "Verified", lastActive: "Today", avatarBg: "bg-purple-100", avatarText: "RF", segment: "sellers" },
    { id: "8.", name: "Cameron Williamson", email: "cameron@seller.com", role: "Seller", location: "Nevada, USA", status: "Pending", health: "Good", verification: "Pending", lastActive: "Oct 9, 2025", avatarBg: "bg-cyan-100", avatarText: "CW", segment: "sellers" },
    { id: "9.", name: "Mary Lynch", email: "mary@buyer.com", role: "Buyer", location: "Washington, USA", status: "Active", health: "Good", verification: "Verified", lastActive: "Oct 8, 2025", avatarBg: "bg-orange-100", avatarText: "ML", segment: "buyers" },
    { id: "10.", name: "Sarah Chen", email: "sarah@buyer.com", role: "Buyer", location: "Colorado, USA", status: "Reported", health: "Poor", verification: "Verified", lastActive: "Oct 7, 2025", avatarBg: "bg-pink-100", avatarText: "SC", segment: "reported" },
];

export const SAMPLE_ADMIN_INVENTORY_LOTS: AdminInventoryLotRecord[] = [
    { id: "1.", title: "Mixed electronics pallet – headphones, speakers, chargers", seller: "John stockton", cat: "Electronics", qty: 50, price: "$200", cond: "Mixed", date: "05-07-2025", status: "Pending", img: "bg-amber-100" },
    { id: "2.", title: "Branded Apparel – 300 pcs (Nike, Adidas, Under Armour)", seller: "Wade Warren", cat: "Apparel & Footwear", qty: 286, price: "$1,500", cond: "New", date: "05-07-2025", status: "Active", img: "bg-blue-100", alert: true },
    { id: "3.", title: "Kitchenware Overstock – 2 Pallets (Cookware & Utensils)", seller: "Kathryn Murphy", cat: "Home & Kitchen", qty: 61, price: "$800", cond: "Overstock", date: "05-07-2025", status: "Active", img: "bg-[#0B0E050A]" },
    { id: "4.", title: "Beauty & Cosmetics Lot – 500 Mixed Units", seller: "Ronald Richards", cat: "Health & Beauty", qty: 29, price: "$1,200", cond: "Shelf Pulls", date: "05-07-2025", status: "Pending", img: "bg-red-100" },
    { id: "5.", title: "Baby Products Pallet – Diapers, Toys, Accessories", seller: "Cameron Williamson", cat: "Toys & Baby", qty: 42, price: "$950", cond: "Customer returns", date: "05-07-2025", status: "Declined", img: "bg-purple-100" },
    { id: "6.", title: "Automotive Accessories – 150 Mixed Items", seller: "Marvin McKinney", cat: "Automotive", qty: 50, price: "$1,700", cond: "Like new", date: "05-07-2025", status: "Active", img: "bg-emerald-100" },
    { id: "7.", title: "Grocery Shelf Pulls – Snacks & Beverages", seller: "Robert Fox", cat: "Grocery & Household", qty: 50, price: "$600", cond: "Overstock", date: "05-07-2025", status: "Out-of-stock", img: "bg-amber-100", alert: true },
    { id: "8.", title: "Office Supplies Pallet – Printers, Paper, Toners", seller: "Savannah Nguyen", cat: "Office & Stationery", qty: 50, price: "$1,100", cond: "Mixed", date: "05-07-2025", status: "Suspended", img: "bg-indigo-100", alert: true },
];

export const SAMPLE_ADMIN_INVENTORY_STATS: AdminInventoryStatsRecord[] = [
    { label: "Total active lots", value: "1,247", iconKey: "storefront", iconBg: "bg-[#1A1AFF14]", iconColor: "text-[#1A1AFF]" },
    { label: "Pending approval", value: "154", iconKey: "hourglass", iconBg: "bg-[#DC680314]", iconColor: "text-[#DC6803]" },
    { label: "Reported lots", value: "32", iconKey: "flag", iconBg: "bg-[#CC292914]", iconColor: "text-[#CC2929]" },
    { label: "Suspended lots", value: "18", iconKey: "xCircle", iconBg: "bg-[#0B0E050A]", iconColor: "text-[#0B0E05A3]" },
];

export const SAMPLE_ADMIN_INVENTORY_TAB_COUNTS: AdminInventoryTabCounts = {
    allLots: 1247,
    pendingApproval: 154,
    reported: 32,
    suspended: 18,
};

export const SAMPLE_ADMIN_COMPLIANCE_STATS: AdminComplianceStatRecord[] = [
    { label: "Pending reviews", value: "42", iconKey: "hourglass", iconBg: "bg-[#DC680314]", iconColor: "text-[#DC6803]" },
    { label: "Approved today", value: "18", iconKey: "checkCircle", iconBg: "bg-[#00A34114]", iconColor: "text-[#00A341]" },
    { label: "Rejected today", value: "3", iconKey: "xCircle", iconBg: "bg-[#CC292914]", iconColor: "text-[#CC2929]" },
    { label: "Avg. review time", value: "2.4 hrs", iconKey: "timerClock", iconBg: "bg-[#1A1AFF14]", iconColor: "text-[#1A1AFF]" },
];

export const SAMPLE_ADMIN_COMPLIANCE_REVIEWS: AdminComplianceReviewRecord[] = [
    { id: "comp-1", sn: "1.", name: "Savannah Nguyen", email: "savannah@example.com", accountType: "Seller", dateSubmitted: "Today", assignedTo: "Jenny Wilson", reviewStatus: "Pending" },
    { id: "comp-2", sn: "2.", name: "John Peters", email: "john@example.com", accountType: "Buyer", dateSubmitted: "Yesterday", assignedTo: "Ralph Edwards", reviewStatus: "In Review" },
    { id: "comp-3", sn: "3.", name: "Ronald Richards", email: "ronald@example.com", accountType: "Seller", dateSubmitted: "Oct 9, 2025", assignedTo: "Sarah Chen", reviewStatus: "Rejected" },
    { id: "comp-4", sn: "4.", name: "Kathryn Murphy", email: "kathryn@example.com", accountType: "Buyer", dateSubmitted: "Oct 8, 2025", assignedTo: "Jenny Wilson", reviewStatus: "Pending" },
    { id: "comp-5", sn: "5.", name: "Marvin McKinney", email: "marvin@example.com", accountType: "Seller", dateSubmitted: "Oct 7, 2025", assignedTo: "Ralph Edwards", reviewStatus: "Approved" },
    { id: "comp-6", sn: "6.", name: "marvin@example.com", email: "marvin@example.com", accountType: "Buyer", dateSubmitted: "Oct 6, 2025", assignedTo: "Sarah Chen", reviewStatus: "Pending" },
];

export const SAMPLE_ADMIN_RFQS: AdminRfqRecord[] = [
    { id: "rfq-1", sn: "1.", name: "John Peters", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-slate-200 text-slate-700", avatarText: "JP", budget: "$5,000 - $7,000", category: "Electronics", date: "Today", mobileTime: "2 mins ago", description: "Looking for 5–10 pallets of mixed electronics (headphones, Bluetooth speakers, and soundbars).", status: "pending" },
    { id: "rfq-2", sn: "2.", name: "Mary Lynch", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-amber-100 text-amber-800", avatarText: "ML", budget: "$4,000 - $6,000", category: "Electronics", date: "Yesterday", mobileTime: "Yesterday", description: "Seeking 3-7 pallets of mixed clothing (shirts, pants, dresses). Looking for premium quality retail overstocks.", status: "pending" },
    { id: "rfq-3", sn: "3.", name: "Sarah Swaty", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-emerald-100 text-emerald-800", avatarText: "SS", budget: "$7,000 - $9,000", category: "Electronics", date: "Oct 8, 2025", mobileTime: "Oct 8, 2025", description: "Seeking 8-12 pallets of mixed apparel (shirts, pants, dresses). Looking for brand new condition items.", status: "pending" },
    { id: "rfq-4", sn: "4.", name: "Connel McAnthony", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-rose-100 text-rose-800", avatarText: "CM", budget: "$8,000 - $10,000", category: "Electronics", date: "Oct 9, 2025", mobileTime: "Oct 9, 2025", description: "Needing 12-15 pallets of mixed home goods (furniture, decor, appliances, cooking utensils) for warehouse inventory restocking.", status: "resolved" },
    { id: "rfq-5", sn: "5.", name: "John McCarthy", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-blue-100 text-blue-800", avatarText: "JM", budget: "$5,000 - $7,000", category: "Electronics", date: "Oct 9, 2025", mobileTime: "Oct 9, 2025", description: "Requesting 3-5 pallets of mixed health and beauty items (cosmetics, skincare, haircare items) with clean retail packaging.", status: "resolved" },
    { id: "rfq-6", sn: "6.", name: "John Peters", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-purple-100 text-purple-800", avatarText: "JP", budget: "$5,000 - $7,000", category: "Electronics", date: "Oct 10, 2025", mobileTime: "Oct 10, 2025", description: "Wanting 7-11 pallets of mixed toys and baby items (toys, diapers, strollers). Needed urgently for the upcoming holiday rush.", status: "pending" },
    { id: "rfq-7", sn: "7.", name: "John Peters", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=60", avatarFallbackBg: "bg-indigo-100 text-indigo-800", avatarText: "JP", budget: "$8,000 - $10,000", category: "Electronics", date: "Oct 10, 2025", mobileTime: "Oct 10, 2025", description: "Acquiring 10-14 pallets of mixed automotive parts (tires, batteries, accessories, and maintenance fluids).", status: "pending" },
];

export const SAMPLE_ADMIN_RFQ_TAB_COUNTS: AdminRfqTabCounts = {
    pending: 109,
    resolved: 4,
};

const SAMPLE_OVERVIEW_QUICK_STATS: AdminOverviewStatRecord[] = [
    { label: "Total GMV", value: "$2,400,501", change: "+12% vs last month", changeColor: "text-[#00A341]", iconKey: "currencyDollar", iconBg: "bg-[#DC6803]/10", iconColor: "text-[#DC6803]" },
    { label: "Active orders", value: "1,247", change: "+27% vs last month", changeColor: "text-[#00A341]", iconKey: "shoppingCart", iconBg: "bg-[#1A1AFF]/10", iconColor: "text-[#1A1AFF]" },
    { label: "Verified sellers", value: "892", change: "+10% vs last month", changeColor: "text-[#00A341]", iconKey: "userCheck", iconBg: "bg-[#00A341]/10", iconColor: "text-[#00A341]" },
    { label: "New buyer signups", value: "3,023", change: "+14% vs last month", changeColor: "text-[#00A341]", iconKey: "userPlus", iconBg: "bg-[#BE02BE]/10", iconColor: "text-[#BE02BE]" },
    { label: "Open disputes", value: "12", change: "-6% vs last month", changeColor: "text-[#CC2929]", iconKey: "warning", iconBg: "bg-[#CC2929]/10", iconColor: "text-[#CC2929]" },
];

const SAMPLE_OVERVIEW_ENGAGEMENT_STATS: AdminOverviewStatRecord[] = [
    { label: "Daily active users", value: "0", changeColor: "text-[#0B0E05A3]", iconKey: "userCheck", iconBg: "bg-[#009D9D]/10", iconColor: "text-[#009D9D]" },
    { label: "Monthly active users", value: "0", changeColor: "text-[#0B0E05A3]", iconKey: "userCheck", iconBg: "bg-[#DC6803]/10", iconColor: "text-[#DC6803]" },
    { label: "Avg. session duration", value: "-- mins", changeColor: "text-[#0B0E05A3]", iconKey: "clock", iconBg: "bg-[#00A34114]", iconColor: "text-[#1A1AFF]" },
    { label: "Churn rate", value: "--%", changeColor: "text-[#0B0E05A3]", iconKey: "userMinus", iconBg: "bg-[#CC2929]/10", iconColor: "text-[#CC2929]" },
    { label: "Seller retention", value: "--%", changeColor: "text-[#0B0E05A3]", iconKey: "userSwitch", iconBg: "bg-[#BE02BE]/10", iconColor: "text-[#BE02BE]" },
];

const SAMPLE_OVERVIEW_ACTIVITY: AdminOverviewActivityRecord[] = [
    { id: "1", title: "New seller verified", subtitle: "Savannah Nguyen completed KYC review", time: "2 mins ago", iconKey: "userCheck", iconBg: "bg-[#00A34114]", iconColor: "text-[#00A341]" },
    { id: "2", title: "Order placed", subtitle: "John Peters placed order #ORD-2024-001", time: "5 mins ago", iconKey: "shoppingCart", iconBg: "bg-[#1A1AFF14]", iconColor: "text-[#1A1AFF]" },
    { id: "3", title: "Dispute opened", subtitle: "Order #ORD-2024-002 flagged by buyer", time: "12 mins ago", iconKey: "warning", iconBg: "bg-[#CC292914]", iconColor: "text-[#CC2929]" },
    { id: "4", title: "RFQ submitted", subtitle: "Mary Lynch posted a new buyer request", time: "18 mins ago", iconKey: "bell", iconBg: "bg-[#BE02BE14]", iconColor: "text-[#BE02BE]" },
];

export function getSampleAdminOverviewDashboard(): AdminOverviewDashboardData {
    return {
        quickStats: SAMPLE_OVERVIEW_QUICK_STATS,
        engagementStats: SAMPLE_OVERVIEW_ENGAGEMENT_STATS,
        activityFeed: SAMPLE_OVERVIEW_ACTIVITY,
    };
}

export function getSampleAdminOverviewCharts(period = "This month") {
    return {
        period,
        trendData: getTrendDataForRange("30D"),
        categoryData: CATEGORY_GMV_DATA,
    };
}

export const SAMPLE_ADMIN_TEAM_MEMBERS: AdminTeamMemberRecord[] = [
    { sn: "1.", name: "Samuel Nathaniel", email: "Samuel@liquidsaio.com", role: "Super admin", lastActive: "2 mins ago", status: "Active", initials: "SN" },
    { sn: "2.", name: "Jenny Wilson", email: "Jenny@liquidsaio.com", role: "Compliance reviewer", lastActive: "1 mins ago", status: "Active", initials: "JW", avatarBg: "bg-[#518300] text-white" },
    { sn: "3.", name: "Ralph Edwards", email: "ralph@liquidsaio.com", role: "Inventory moderator", lastActive: "yesterday", status: "Active", initials: "RE" },
    { sn: "4.", name: "Sarah Chen", email: "sarah@liquidsaio.com", role: "Compliance reviewer", lastActive: "2 days ago", status: "Pending", initials: "SC" },
    { sn: "5.", name: "Theresa Webb", email: "theresa@liquidsaio.com", role: "Viewer", lastActive: "Oct 9, 2025", status: "Pending", initials: "TW" },
];

export const SAMPLE_ADMIN_SETTINGS_PROFILE: AdminSettingsProfileData = {
    firstName: "Samuel",
    lastName: "Nathaniel",
    email: "samuel@liquidsaio.com",
    phone: "5551234567",
    phoneNumberCountryCode: "US",
    timezone: "gmt-05",
    profileImageUrl: null,
};

export const SAMPLE_ADMIN_SETTINGS_GENERAL: AdminSettingsGeneralData = {
    contactEmail: "support@liquidsaio.com",
    phoneNumber: "+18005550199",
    phoneNumberCountryCode: "US",
};
