import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import {
    AUTH_FORM_SCHEMA,
    type AuthFormSchemaName,
} from "@/lib/auth/schemas/auth-form-schema.constant";
import { adminLoginSchema, type AdminLoginFormValues } from "@/lib/auth/schemas/login.schema";
import {
    adminSignUpSchema,
    type AdminSignUpFormValues,
    toAdminSignUpRequestBody,
} from "@/lib/auth/schemas/sign-up.schema";
import {
    adminVerify2FaSchema,
    type AdminVerify2FaFormValues,
} from "@/lib/auth/schemas/verify-2fa.schema";

export { AUTH_FORM_SCHEMA, type AuthFormSchemaName };
export { adminLoginSchema, type AdminLoginFormValues };
export { adminSignUpSchema, type AdminSignUpFormValues, toAdminSignUpRequestBody };
export { adminVerify2FaSchema, type AdminVerify2FaFormValues };

/** Maps each schema name to its Zod schema definition. */
const authFormSchemaRegistry = {
    [AUTH_FORM_SCHEMA.LOGIN]: adminLoginSchema,
    [AUTH_FORM_SCHEMA.SIGN_UP]: adminSignUpSchema,
    [AUTH_FORM_SCHEMA.VERIFY_2FA]: adminVerify2FaSchema,
} as const;

/** Maps each schema name to its inferred form values type. */
export type AuthFormValuesBySchema = {
    [AUTH_FORM_SCHEMA.LOGIN]: AdminLoginFormValues;
    [AUTH_FORM_SCHEMA.SIGN_UP]: AdminSignUpFormValues;
    [AUTH_FORM_SCHEMA.VERIFY_2FA]: AdminVerify2FaFormValues;
};

export type AuthFormValues<TSchemaName extends AuthFormSchemaName> =
    AuthFormValuesBySchema[TSchemaName];

/**
 * Returns the Zod schema for a named auth form.
 * @param schemaName - One of `AUTH_FORM_SCHEMA` values.
 */
export function getAuthFormSchema<TSchemaName extends AuthFormSchemaName>(
    schemaName: TSchemaName,
): (typeof authFormSchemaRegistry)[TSchemaName] {
    switch (schemaName) {
        case AUTH_FORM_SCHEMA.LOGIN:
        case AUTH_FORM_SCHEMA.SIGN_UP:
        case AUTH_FORM_SCHEMA.VERIFY_2FA:
            return authFormSchemaRegistry[schemaName];
        default: {
            const unknownSchemaName: never = schemaName;
            throw new Error(`Unknown auth form schema: ${unknownSchemaName}`);
        }
    }
}

/**
 * Returns a React Hook Form resolver for a named auth schema.
 * @param schemaName - One of `AUTH_FORM_SCHEMA` values.
 */
export function getAuthFormResolver<TSchemaName extends AuthFormSchemaName>(
    schemaName: TSchemaName,
): Resolver<AuthFormValues<TSchemaName>> {
    return zodResolver(getAuthFormSchema(schemaName)) as unknown as Resolver<
        AuthFormValues<TSchemaName>
    >;
}
