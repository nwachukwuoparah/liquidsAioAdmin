import { z } from "zod";
import { DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE } from "@/lib/auth/constants/sign-up.constant";
import {
    authFirstNameFieldSchema,
    authLastNameFieldSchema,
    authPasswordFieldSchema,
    authPhoneNumberFieldSchema,
} from "@/lib/auth/schemas/auth-schema-fields";
import { parsePhoneNumber } from "react-phone-number-input";

export const adminSignUpSchema = z
    .object({
        firstName: authFirstNameFieldSchema,
        lastName: authLastNameFieldSchema,
        password: authPasswordFieldSchema,
        confirmPassword: z.string().min(1, "Confirm your password."),
        phoneNumber: authPhoneNumberFieldSchema,
    })
    .refine((formValues) => formValues.password === formValues.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

export type AdminSignUpFormValues = z.infer<typeof adminSignUpSchema>;

/** Payload sent to the signup API (confirmPassword excluded). */
export type AdminSignUpRequestBody = Omit<AdminSignUpFormValues, "confirmPassword"> & {
    phoneNumberCountryCode: string;
};

/** Maps validated sign-up form values to the API request body. */
export function toAdminSignUpRequestBody(formValues: AdminSignUpFormValues): AdminSignUpRequestBody {
    const parsedPhoneNumber = parsePhoneNumber(formValues.phoneNumber);
    const { confirmPassword: _confirmPassword, ...requestBodyWithoutCountryCode } = formValues;

    return {
        ...requestBodyWithoutCountryCode,
        phoneNumberCountryCode:
            parsedPhoneNumber?.country?.toUpperCase() ?? DEFAULT_SIGN_UP_PHONE_COUNTRY_CODE,
    };
}
