import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";
import { z } from "zod";
import { ADMIN_LOGIN_MIN_PASSWORD_LENGTH } from "@/lib/auth/constants/auth-api.constant";
import { SUPPORTED_COUNTRY_CODE } from "@/lib/constants/supported-region.constant";

/** Shared email field validation for auth forms. */
export const authEmailFieldSchema = z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.");

/** Shared password field validation for auth forms. */
export const authPasswordFieldSchema = z
    .string()
    .min(
        ADMIN_LOGIN_MIN_PASSWORD_LENGTH,
        `Password must be at least ${ADMIN_LOGIN_MIN_PASSWORD_LENGTH} characters.`,
    );

/** Shared first-name field validation for auth forms. */
export const authFirstNameFieldSchema = z.string().trim().min(1, "First name is required.");

/** Shared last-name field validation for auth forms. */
export const authLastNameFieldSchema = z.string().trim().min(1, "Last name is required.");

/** Two-letter ISO country code for phone numbers. */
export const authPhoneCountryCodeFieldSchema = z
    .string()
    .trim()
    .length(2, "Country code must be 2 letters.")
    .transform((countryCode) => countryCode.toUpperCase());

/** Phone number field validation for auth forms (E.164 format, U.S. only). */
export const authPhoneNumberFieldSchema = z
    .string()
    .min(1, "Phone number is required.")
    .refine((phoneNumber) => isValidPhoneNumber(phoneNumber), "Enter a valid phone number.")
    .refine((phoneNumber) => {
        const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
        return parsedPhoneNumber?.country?.toUpperCase() === SUPPORTED_COUNTRY_CODE;
    }, "Enter a valid U.S. phone number.");
