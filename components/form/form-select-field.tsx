"use client";

import { FormFieldLabel } from "@/components/form/form-field-label";
import { CaretRightIcon } from "@/components/vector";
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";

interface FormSelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    hint?: string;
    errorMessage?: string;
    isRequired?: boolean;
    showRequiredIndicator?: boolean;
    options: ReadonlyArray<{ value: string; label: string }>;
    trailingIcon?: ReactNode;
}

/** Labelled select field with optional required indicator and helper text. */
export const FormSelectField = forwardRef<HTMLSelectElement, FormSelectFieldProps>(
    function FormSelectField(
        {
            label,
            hint,
            errorMessage,
            isRequired = false,
            showRequiredIndicator = true,
            options,
            trailingIcon,
            className = "",
            id,
            ...selectProps
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
                    <select
                        id={fieldId}
                        ref={ref}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${fieldId}-error` : undefined}
                        {...selectProps}
                        className={`w-full appearance-none rounded-xl border bg-[#FFFFFF] px-4 py-3 pr-10 text-sm text-[#0B0E05] outline-none transition-colors focus:border-[#518300] disabled:cursor-not-allowed disabled:bg-[#0B0E050A] disabled:text-[#0B0E05A3] ${hasError ? "border-[#CC2929]" : "border-[#0B0E0514]"} ${className}`}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#0B0E05A3]">
                        {trailingIcon ?? <CaretRightIcon className="h-4 w-4 rotate-90" />}
                    </div>
                </div>
                {errorMessage ? (
                    <p id={`${fieldId}-error`} className="text-sm text-[#CC2929]">
                        {errorMessage}
                    </p>
                ) : null}
            </div>
        );
    },
);
