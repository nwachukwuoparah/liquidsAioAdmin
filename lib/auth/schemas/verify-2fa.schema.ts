import { z } from "zod";
import { AUTH_OTP_LENGTH } from "@/lib/auth/constants/two-factor.constant";

export const adminVerify2FaSchema = z.object({
    otpCode: z
        .string()
        .regex(/^\d+$/, "Enter numbers only.")
        .length(AUTH_OTP_LENGTH, `Enter all ${AUTH_OTP_LENGTH} digits to continue.`),
});

export type AdminVerify2FaFormValues = z.infer<typeof adminVerify2FaSchema>;
