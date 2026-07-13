import { z } from "zod";
import {
    authEmailFieldSchema,
    authPhoneNumberFieldSchema,
} from "@/lib/auth/schemas/auth-schema-fields";

/**
 * Phone input can emit `undefined` when only the country code is selected.
 * Normalize that to an empty string so required validation runs.
 * Prefer union+transform over `z.preprocess` so the input type stays typed
 * (preprocess forces `unknown` and breaks `zodResolver` + `useForm`).
 */
const adminSettingsGeneralPhoneFieldSchema = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((phoneNumber) => (phoneNumber == null ? "" : phoneNumber))
    .pipe(authPhoneNumberFieldSchema);

/** Validates the general settings (company info) form. */
export const adminSettingsGeneralSchema = z.object({
    contactEmail: authEmailFieldSchema,
    phoneNumber: adminSettingsGeneralPhoneFieldSchema,
});

export type AdminSettingsGeneralFormValues = z.output<typeof adminSettingsGeneralSchema>;
export type AdminSettingsGeneralFormInput = z.input<typeof adminSettingsGeneralSchema>;
