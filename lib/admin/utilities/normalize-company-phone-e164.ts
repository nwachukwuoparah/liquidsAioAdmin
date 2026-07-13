import {
    getCountryCallingCode,
    parsePhoneNumber,
    type Country,
} from "react-phone-number-input";
import { DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE } from "@/lib/auth/constants/sign-up.constant";

function digitsOnly(value: string): string {
    return value.replace(/\D/g, "");
}

/**
 * Normalizes company phone fields into E.164 for the support-phone input.
 * Handles already-E.164 values, national numbers with a country code, and dial-code-only digits.
 */
export function normalizeCompanyPhoneToE164(
    phoneNumber: string,
    phoneNumberCountryCode = "",
): string {
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedPhone) {
        return "";
    }

    const countryCode = (phoneNumberCountryCode.trim().toUpperCase() ||
        DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE) as Country;

    if (trimmedPhone.startsWith("+")) {
        const parsedInternational = parsePhoneNumber(trimmedPhone);
        return parsedInternational?.format("E.164") ?? `+${digitsOnly(trimmedPhone)}`;
    }

    const parsedWithCountry = parsePhoneNumber(trimmedPhone, countryCode);
    if (parsedWithCountry) {
        return parsedWithCountry.format("E.164");
    }

    try {
        const callingCode = getCountryCallingCode(countryCode);
        const nationalDigits = digitsOnly(trimmedPhone);

        if (nationalDigits) {
            const withCallingCode = parsePhoneNumber(`+${callingCode}${nationalDigits}`);
            if (withCallingCode) {
                return withCallingCode.format("E.164");
            }
        }
    } catch {
        // Fall through to digit-based normalization.
    }

    const digits = digitsOnly(trimmedPhone);

    if (digits.length === 10) {
        return `+1${digits}`;
    }

    if (digits.length === 11 && digits.startsWith("1")) {
        return `+${digits}`;
    }

    return trimmedPhone;
}
