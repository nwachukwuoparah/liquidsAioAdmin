import type { AdminSettingsProfileData } from "@/lib/admin/types/admin-api.types";
import { normalizeCompanyPhoneToE164 } from "@/lib/admin/utilities/normalize-company-phone-e164";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";

interface AdminProfileFields {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    phoneNumberCountryCode?: string;
    timezone?: string;
    timeZone?: string;
    profilePicture?: string;
    profileImageUrl?: string;
    kyc?: {
        phone?: string;
        phoneNumber?: string;
    };
    businessAddress?: {
        phone?: string;
        phoneNumber?: string;
    };
}

interface AdminProfileMeApiPayload extends AdminProfileFields {
    /** Admin token shape from GET /profile/me. */
    profile?: AdminProfileFields;
    /** Legacy / alternate nested shapes. */
    user?: AdminProfileFields;
    buyerProfile?: {
        phone?: string;
        phoneNumber?: string;
        timezone?: string;
    };
    sellerProfile?: {
        phone?: string;
        phoneNumber?: string;
        timezone?: string;
    };
    kyc?: {
        phone?: string;
        phoneNumber?: string;
    };
    businessAddress?: {
        phone?: string;
        phoneNumber?: string;
    };
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "";
}

/** Parses GET /profile/me into profile settings form values. */
export function parseAdminSettingsProfileFromUserDetail(body: unknown): AdminSettingsProfileData {
    const payload = parseAdminApiResponseData<AdminProfileMeApiPayload>(body);
    const profile = payload.profile ?? payload.user ?? payload;
    const phoneNumberCountryCode = firstNonEmpty(profile.phoneNumberCountryCode) || null;
    const rawPhone = firstNonEmpty(
        profile.phoneNumber,
        profile.phone,
        profile.kyc?.phone,
        profile.kyc?.phoneNumber,
        payload.kyc?.phone,
        payload.kyc?.phoneNumber,
        profile.businessAddress?.phone,
        profile.businessAddress?.phoneNumber,
        payload.businessAddress?.phone,
        payload.businessAddress?.phoneNumber,
        payload.buyerProfile?.phone,
        payload.buyerProfile?.phoneNumber,
        payload.sellerProfile?.phone,
        payload.sellerProfile?.phoneNumber,
    );

    return {
        firstName: firstNonEmpty(profile.firstName),
        lastName: firstNonEmpty(profile.lastName),
        email: firstNonEmpty(profile.email),
        phone: rawPhone
            ? normalizeCompanyPhoneToE164(rawPhone, phoneNumberCountryCode ?? "")
            : "",
        phoneNumberCountryCode,
        timezone: firstNonEmpty(
            profile.timezone,
            profile.timeZone,
            payload.timezone,
            payload.timeZone,
            payload.buyerProfile?.timezone,
            payload.sellerProfile?.timezone,
            "gmt-05",
        ),
        profileImageUrl:
            firstNonEmpty(
                profile.profilePicture,
                profile.profileImageUrl,
                payload.profilePicture,
                payload.profileImageUrl,
            ) || null,
    };
}
