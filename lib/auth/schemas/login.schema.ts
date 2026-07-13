import { z } from "zod";
import { authEmailFieldSchema, authPasswordFieldSchema } from "@/lib/auth/schemas/auth-schema-fields";

export const adminLoginSchema = z.object({
    email: authEmailFieldSchema,
    password: authPasswordFieldSchema,
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
