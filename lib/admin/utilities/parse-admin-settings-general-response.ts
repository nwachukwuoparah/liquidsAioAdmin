import type { AdminSettingsGeneralData } from "@/lib/admin/types/admin-api.types";
import { normalizeCompanyPhoneToE164 } from "@/lib/admin/utilities/normalize-company-phone-e164";
import { parseAdminApiResponseData } from "@/lib/admin/utilities/parse-admin-api-response-data";

interface AdminSettingsGeneralApiRecord {
    contactEmail?: string | null;
    contact_email?: string | null;
    phoneNumber?: string | null;
    phone_number?: string | null;
    phoneNumberCountryCode?: string | null;
    phone_number_country_code?: string | null;
    /** Legacy sample-route field name. */
    supportPhone?: string | null;
    support_phone?: string | null;
}

interface AdminSettingsGeneralApiPayload extends AdminSettingsGeneralApiRecord {
    settings?: AdminSettingsGeneralApiRecord | null;
    general?: AdminSettingsGeneralApiRecord | null;
    companyInfo?: AdminSettingsGeneralApiRecord | null;
    company_info?: AdminSettingsGeneralApiRecord | null;
    company?: AdminSettingsGeneralApiRecord | null;
}

function readString(value: string | null | undefined): string {
    return typeof value === "string" ? value.trim() : "";
}

/** Parses GET /company/info (or create response) into normalized general settings fields. */
export function parseAdminSettingsGeneralResponse(body: unknown): AdminSettingsGeneralData {
    const payload = parseAdminApiResponseData<AdminSettingsGeneralApiPayload | null>(body);

    if (payload === null || payload === undefined) {
        return {
            contactEmail: "",
            phoneNumber: "",
            phoneNumberCountryCode: "",
        };
    }

    const settings =
        payload.settings ??
        payload.general ??
        payload.companyInfo ??
        payload.company_info ??
        payload.company ??
        payload;

    const contactEmail = readString(settings.contactEmail ?? settings.contact_email);
    const phoneNumberCountryCode = readString(
        settings.phoneNumberCountryCode ?? settings.phone_number_country_code,
    );
    const rawPhoneNumber = readString(
        settings.phoneNumber ??
            settings.phone_number ??
            settings.supportPhone ??
            settings.support_phone,
    );

    return {
        contactEmail,
        phoneNumber: normalizeCompanyPhoneToE164(rawPhoneNumber, phoneNumberCountryCode),
        phoneNumberCountryCode,
    };
}
