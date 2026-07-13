import { parsePhoneNumber } from "react-phone-number-input";
import { DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE } from "@/lib/auth/constants/sign-up.constant";
import type { AdminSettingsGeneralRequestBody } from "@/lib/admin/types/admin-api.types";

export interface AdminSettingsGeneralFormValues {
    contactEmail: string;
    phoneNumber: string;
}

/**
 * Maps general-settings form values to POST /settings/company-info.
 * `phoneNumber` and `phoneNumberCountryCode` are both sent or both omitted.
 */
export function toAdminSettingsGeneralRequestBody(
    formValues: AdminSettingsGeneralFormValues,
): AdminSettingsGeneralRequestBody {
    const contactEmail = formValues.contactEmail.trim();
    const phoneNumber = formValues.phoneNumber.trim();

    if (!phoneNumber) {
        return { contactEmail };
    }

    const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

    return {
        contactEmail,
        phoneNumber,
        phoneNumberCountryCode:
            parsedPhoneNumber?.country?.toUpperCase() ?? DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE,
    };
}
