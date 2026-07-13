import { parsePhoneNumber } from "react-phone-number-input";
import type { AdminSettingsProfileRequestBody } from "@/lib/admin/types/admin-api.types";
import type { AdminSettingsProfileFormValues } from "@/lib/admin/schemas/admin-settings-profile.schema";
import { DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE } from "@/lib/auth/constants/sign-up.constant";
import { getClientTimezone } from "@/lib/helpers/client-device";

/** Maps profile settings form values to PATCH /profile/admins. */
export function toAdminSettingsProfileRequestBody(
    formValues: AdminSettingsProfileFormValues,
): AdminSettingsProfileRequestBody {
    const nameParts = formValues.fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || firstName;
    const phoneNumber = formValues.phoneNumber.trim();
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

    return {
        firstName,
        lastName,
        phoneNumber,
        phoneNumberCountryCode:
            parsedPhoneNumber?.country?.toUpperCase() ?? DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE,
        timezone: getClientTimezone(),
    };
}
