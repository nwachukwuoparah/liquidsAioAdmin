import { z } from "zod";
import { authPhoneNumberFieldSchema } from "@/lib/auth/schemas/auth-schema-fields";

/**
 * Phone input can emit `undefined` when only the country code is selected.
 * Normalize that to an empty string so required validation runs.
 * Prefer union+transform over `z.preprocess` so the input type stays typed
 * (preprocess forces `unknown` and breaks `zodResolver` + `useForm`).
 */
const adminSettingsProfilePhoneFieldSchema = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((phoneNumber) => (phoneNumber == null ? "" : phoneNumber))
    .pipe(authPhoneNumberFieldSchema);

/** Validates the My profile settings form. */
export const adminSettingsProfileSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, "Full name is required.")
        .refine((fullName) => fullName.split(/\s+/).filter(Boolean).length >= 2, {
            message: "Enter your first and last name.",
        }),
    phoneNumber: adminSettingsProfilePhoneFieldSchema,
});

export type AdminSettingsProfileFormValues = z.output<typeof adminSettingsProfileSchema>;
export type AdminSettingsProfileFormInput = z.input<typeof adminSettingsProfileSchema>;
