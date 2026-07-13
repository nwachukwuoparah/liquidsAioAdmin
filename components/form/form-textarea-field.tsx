"use client";

import { FormFieldLabel } from "@/components/form/form-field-label";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface FormTextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    hint?: string;
    errorMessage?: string;
    isRequired?: boolean;
    showRequiredIndicator?: boolean;
}

/** Labelled textarea field with optional required indicator and helper text. */
export const FormTextareaField = forwardRef<HTMLTextAreaElement, FormTextareaFieldProps>(
    function FormTextareaField(
        {
            label,
            hint,
            errorMessage,
            isRequired = false,
            showRequiredIndicator = true,
            className = "",
            id,
            ...textareaProps
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
                <textarea
                    id={fieldId}
                    ref={ref}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${fieldId}-error` : undefined}
                    {...textareaProps}
                    className={`min-h-[120px] w-full resize-y rounded-xl border bg-[#FFFFFF] px-4 py-3 text-sm text-[#0B0E05] outline-none transition-colors placeholder:text-[#0B0E05A3] focus:border-[#518300] disabled:cursor-not-allowed disabled:bg-[#0B0E050A] disabled:text-[#0B0E05A3] ${hasError ? "border-[#CC2929]" : "border-[#0B0E0514]"} ${className}`}
                />
                {errorMessage ? (
                    <p id={`${fieldId}-error`} className="text-sm text-[#CC2929]">
                        {errorMessage}
                    </p>
                ) : null}
            </div>
        );
    },
);
