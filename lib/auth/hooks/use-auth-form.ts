"use client";

import {
    getAuthFormResolver,
    type AuthFormSchemaName,
    type AuthFormValues,
} from "@/lib/auth/schemas";
import { useForm, type UseFormProps, type UseFormReturn } from "react-hook-form";

type UseAuthFormOptions<TSchemaName extends AuthFormSchemaName> = Omit<
    UseFormProps<AuthFormValues<TSchemaName>>,
    "resolver"
>;

/**
 * Creates a React Hook Form instance validated by the named auth schema.
 * @param schemaName - One of `AUTH_FORM_SCHEMA` values.
 * @param formOptions - Optional React Hook Form configuration.
 */
export function useAuthForm<TSchemaName extends AuthFormSchemaName>(
    schemaName: TSchemaName,
    formOptions?: UseAuthFormOptions<TSchemaName>,
): UseFormReturn<AuthFormValues<TSchemaName>> {
    return useForm<AuthFormValues<TSchemaName>>({
        ...formOptions,
        resolver: getAuthFormResolver(schemaName),
    });
}
