"use client";

import { FormFieldLabel } from "@/components/form/form-field-label";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface AuthFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    hint?: string;
    errorMessage?: string;
    isRequired?: boolean;
    showRequiredIndicator?: boolean;
    trailingIcon?: ReactNode;
}

/** Labelled input field styled for auth and admin forms. */
export const AuthFormField = forwardRef<HTMLInputElement, AuthFormFieldProps>(function AuthFormField(
    {
        label,
        hint,
        errorMessage,
        isRequired = false,
        showRequiredIndicator = true,
        trailingIcon,
        className = "",
        id,
        ...inputProps
    },
    ref,
) {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const hasError = Boolean(errorMessage);

    return (
        <div className="space-y-2">
            <FormFieldLabel
                label={label}
                htmlFor={fieldId}
                hint={hint}
                isRequired={isRequired}
                showRequiredIndicator={showRequiredIndicator}
            />
            <div className="relative">
                <input
                    id={fieldId}
                    ref={ref}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${fieldId}-error` : undefined}
                    {...inputProps}
                    className={`w-full rounded-xl border bg-[#FFFFFF] px-4 py-3 text-sm text-[#0B0E05] outline-none transition-colors placeholder:text-[#0B0E05A3] focus:border-[#518300] disabled:cursor-not-allowed disabled:bg-[#0B0E050A] disabled:text-[#0B0E05A3] ${hasError ? "border-[#CC2929]" : "border-[#0B0E0514]"} ${trailingIcon ? "pr-11" : ""} ${className}`}
                />
                {trailingIcon ? (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#0B0E05A3]">
                        {trailingIcon}
                    </div>
                ) : null}
            </div>
            {errorMessage ? (
                <p id={`${fieldId}-error`} className="text-sm text-[#CC2929]">
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
});
