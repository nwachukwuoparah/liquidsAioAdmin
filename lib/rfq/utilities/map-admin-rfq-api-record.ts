import type { AdminRfqRecord } from "@/lib/admin/types/admin-api.types";
import type { AdminRfqTabStatus } from "@/lib/rfq/constants/admin-rfqs-api.constant";
import type {
    AdminRfqApiRecord,
    AdminRfqCreatorProfile,
} from "@/lib/rfq/types/admin-rfqs-api.types";
import { getInitialsFromName } from "@/lib/profile-avatar";

const AVATAR_FALLBACK_CLASSES = [
    "bg-slate-200 text-slate-700",
    "bg-amber-100 text-amber-800",
    "bg-emerald-100 text-emerald-800",
    "bg-rose-100 text-rose-800",
    "bg-blue-100 text-blue-800",
    "bg-purple-100 text-purple-800",
    "bg-indigo-100 text-indigo-800",
] as const;

function resolveCreatorProfile(record: AdminRfqApiRecord): AdminRfqCreatorProfile | undefined {
    return record.user;
}

function resolveCreatorName(profile?: AdminRfqCreatorProfile): string {
    if (!profile) {
        return "Unknown buyer";
    }

    if (profile.firstName?.trim()) {
        return profile.firstName.trim();
    }

    const firstName = profile.firstName?.trim() ?? "";
    const lastName = profile.lastName?.trim() ?? "";
    const combinedName = `${firstName} ${lastName}`.trim();

    return combinedName || "Unknown buyer";
}

function resolveAvatarUrl(profile?: AdminRfqCreatorProfile): string {
    return profile?.profilePicture ?? "";
}

function resolveAvatarFallbackClass(name: string): string {
    const hash = Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0);
    return AVATAR_FALLBACK_CLASSES[hash % AVATAR_FALLBACK_CLASSES.length];
}

/** Formats an RFQ budget range from min/max price for table and detail views. */
export function formatAdminRfqBudget(
    minPrice?: number | null,
    maxPrice?: number | null,
): string {
    if (minPrice != null && maxPrice != null) {
        return `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
    }

    if (minPrice != null) {
        return `$${minPrice.toLocaleString()}+`;
    }

    if (maxPrice != null) {
        return `Up to $${maxPrice.toLocaleString()}`;
    }

    return "—";
}

function resolveBudget(record: AdminRfqApiRecord): string {
    return formatAdminRfqBudget(record.minPrice, record.maxPrice);
}

function resolveDescription(record: AdminRfqApiRecord): string {
    return record.description?.trim() || record.requirements?.trim() || "—";
}

function formatRelativeTime(isoDate?: string): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    const elapsedMinutes = Math.floor((Date.now() - parsedDate.getTime()) / 60000);

    if (elapsedMinutes < 1) {
        return "Just now";
    }

    if (elapsedMinutes < 60) {
        return `${elapsedMinutes} mins ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);

    if (elapsedHours < 24) {
        return elapsedHours === 1 ? "1 hour ago" : `${elapsedHours} hours ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedDays === 1) {
        return "Yesterday";
    }

    if (elapsedDays < 7) {
        return `${elapsedDays} days ago`;
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** Formats an RFQ ISO date for table and detail views (Today / Yesterday / Mon D, YYYY). */
export function formatAdminRfqDate(isoDate?: string | null): string {
    if (!isoDate) {
        return "—";
    }

    const parsedDate = new Date(isoDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return isoDate;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (parsedDate >= startOfToday) {
        return "Today";
    }

    if (parsedDate >= startOfYesterday) {
        return "Yesterday";
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function normalizeStatus(status?: string): AdminRfqTabStatus {
    return status?.toLowerCase() === "resolved" ? "resolved" : "pending";
}

/** Maps a backend RFQ record into the admin table row shape. */
export function mapAdminRfqApiRecord(
    record: AdminRfqApiRecord,
    index: number,
): AdminRfqRecord {
    const creatorProfile = resolveCreatorProfile(record);
    const buyerName = resolveCreatorName(creatorProfile);

    return {
        id: record.id,
        sn: `${index + 1}.`,
        name: buyerName,
        avatarUrl: resolveAvatarUrl(creatorProfile),
        avatarFallbackBg: resolveAvatarFallbackClass(buyerName),
        avatarText: getInitialsFromName(buyerName),
        budget: resolveBudget(record),
        category: record.category?.trim() || "—",
        date: formatAdminRfqDate(record.createdAt),
        mobileTime: formatRelativeTime(record.createdAt),
        description: resolveDescription(record),
        status: normalizeStatus(record.status),
    };
}
