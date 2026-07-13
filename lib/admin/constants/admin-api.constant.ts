/** Sample admin API base path (served from Next.js route handlers in dev). */
export const ADMIN_API_BASE_PATH = "/admin";

export const ADMIN_ORDERS_PATH = `${ADMIN_API_BASE_PATH}/orders`;
export const ADMIN_ORDERS_STATS_PATH = `${ADMIN_API_BASE_PATH}/orders/stats`;
export const ADMIN_ORDERS_ACTIONS_PATH = `${ADMIN_API_BASE_PATH}/orders/actions`;

export const ADMIN_USERS_PATH = `/users`;
export const ADMIN_USERS_STATS_PATH = `/users/stats`;

/** Returns the admin user detail path: GET /users/{userId}. */
export function getAdminUserDetailPath(userId: string): string {
    return `${ADMIN_USERS_PATH}/${encodeURIComponent(userId)}`;
}

/** Signed-in admin profile: GET /profile/me. */
export const ADMIN_PROFILE_ME_PATH = "/profile/me";
/** PATCH update the signed-in admin profile. */
export const ADMIN_PROFILE_ADMINS_PATH = "/profile/admins";
/** GET signed Cloudinary upload credentials for the profile picture. */
export const ADMIN_PROFILE_PICTURE_SIGNED_UPLOAD_PATH = "/profile/picture/signed-upload";
/** POST save the uploaded profile picture URL. */
export const ADMIN_PROFILE_PICTURE_PATH = "/profile/picture";

export { ADMIN_LOTS_PATH as ADMIN_INVENTORY_LOTS_PATH } from "@/lib/inventory/constants/admin-inventory-api.constant";
export const ADMIN_INVENTORY_STATS_PATH = `/inventory/stats`;
export const ADMIN_INVENTORY_OVERVIEW_PATH = `/lots/admin-overview`;
export const ADMIN_INVENTORY_ACTIONS_PATH = `${ADMIN_API_BASE_PATH}/inventory/actions`;

export const ADMIN_COMPLIANCE_REVIEWS_PATH = `/compliance`;
export const ADMIN_COMPLIANCE_OVERVIEW_PATH = `/compliance/overview`;
export const ADMIN_COMPLIANCE_ACTIONS_PATH = `${ADMIN_API_BASE_PATH}/compliance/actions`;
export { ADMIN_COMPLIANCE_REVIEW_PATH } from "@/lib/compliance/constants/admin-compliance-review.constant";

/** Returns the compliance detail path for a user id. */
export function getAdminComplianceDetailPath(userId: string): string {
    return `/compliance/${userId}`;
}

/** Returns the compliance assignee update path for a user id. */
export function getAdminComplianceAssignPath(userId: string): string {
    return `/compliance/${userId}/assign`;
}

/** Returns the path to claim a compliance case for the current admin. */
export function getAdminComplianceClaimPath(userId: string): string {
    return `/compliance/${encodeURIComponent(userId)}/claim`;
}

/** Returns the path to release a previously claimed compliance case. */
export function getAdminComplianceUnclaimPath(userId: string): string {
    return `/compliance/${encodeURIComponent(userId)}/unclaim`;
}

export const ADMIN_RFQS_PATH = `${ADMIN_API_BASE_PATH}/rfqs`;

export const ADMIN_OVERVIEW_PATH = `${ADMIN_API_BASE_PATH}/overview`;

export { ADMIN_TEAM_MEMBERS_PATH } from "@/lib/team/constants/admin-invite.constant";
export const ADMIN_SETTINGS_PROFILE_PATH = "/settings/profile";
/** GET singleton company contact details for general settings. */
export const ADMIN_COMPANY_INFO_PATH = "/company/info";
/** POST create singleton company info (settings:edit:general). */
export const ADMIN_SETTINGS_COMPANY_INFO_PATH = "/settings/company-info";
